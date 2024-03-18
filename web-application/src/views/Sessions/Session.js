import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, Box, Modal, Typography } from '@mui/material';
import AppContext from '../../AppContext';
import { mountedStyle, unmountedStyle } from '../../ui/AnimationStyles';
import UserCard from '../../components/UserCard/UserCard';
import SessionWrapper from './Session.styled';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { Mic } from '@mui/icons-material';
import Button from '@mui/material/Button';
import theme from '../../ui/theme';
import InviteOthers from '../../components/UserCard/InviteOthers';
import { errorCodeToSnackbar, extractSessionCode } from '../../utils';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import SyncStageUserDelegate from '../../SyncStageUserDelegate';
import SyncStageConnectivityDelegate from '../../SyncStageConnectivityDelegate';
import { enqueueSnackbar } from 'notistack';
import { PathEnum } from '../../router/PathEnum';
import produce from 'immer';
import modalStyle from '../../ui/ModalStyle';
import ButtonContained from '../../components/StyledButtonContained';

const MEASUREMENTS_INTERVAL_MS = 5000;

const Session = ({ onLeaveSession, inSession, onStartRecording, onStopRecording }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    sessionCode,
    sessionData,
    setSessionData,
    syncStage,
    desktopAgentProvisioned,
    setDesktopAgentProvisioned,
    selectedServer,
    nickname,
    setBackdropOpen,
    persistSessionCode,
  } = useContext(AppContext);

  const [updateMeasurementsIntervalId, setUpdateMeasurementsIntervalId] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Transmitter
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [measurements, setMeasurements] = useState({});

  // Receivers
  const [measurementsMap, setMeasurementsMap] = useState({});
  const [volumeMap, setVolumeMap] = useState({});
  const [connectedMap, setConnectedMap] = useState({});
  const [receiversMap, setReceiversMap] = useState({});

  const onSessionOut = useCallback(() => {
    enqueueSnackbar('You have been disconnected from session');
    setSessionData(null);
    navigate(PathEnum.SESSIONS_JOIN);
  }, []);

  const onMutedToggle = useCallback(async () => {
    const mutedState = !muted;
    setMuted(mutedState);
    const errorCode = await syncStage.toggleMicrophone(mutedState);
    errorCodeToSnackbar(errorCode);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setMuted(!mutedState);
    }
  }, [syncStage, muted]);

  const onUserJoined = useCallback(async (connection) => {
    console.log('onUserJoined');
    // Not adding self connection and avoid duplicates
    if (
      (sessionData && sessionData.transmitter && sessionData.transmitter.identifier === connection.identifier) ||
      receiversMap[connection.identifier]
    ) {
      return;
    }

    setReceiversMap(
      produce((draft) => {
        draft[connection.identifier] = connection;
      }),
    );
    // Volume

    const [volumeValue, errorCode] = await syncStage.getReceiverVolume(connection.identifier);
    errorCodeToSnackbar(errorCode);

    setVolumeMap(
      produce((draft) => {
        draft[connection.identifier] = volumeValue;
      }),
    );
  }, []);

  const onUserLeft = useCallback((identifier) => {
    console.log('onUserLeft');

    setReceiversMap(
      produce((draft) => {
        delete draft[identifier];
      }),
    );
  }, []);

  const onUserMuted = useCallback((identifier) => {
    setReceiversMap(
      produce((draft) => {
        if (draft[identifier]) {
          draft[identifier].isMuted = true;
        }
      }),
    );
  }, []);

  const onRecordingStarted = useCallback(() => {
    console.log('onRecordingStarted');

    setIsRecording(true);
  }, []);

  const onRecordingStopped = useCallback(() => {
    console.log('onRecordingStopped');

    setIsRecording(false);
  }, []);

  const onUserUnmuted = useCallback((identifier) => {
    setReceiversMap(
      produce((draft) => {
        if (draft[identifier]) {
          draft[identifier].isMuted = false;
        }
      }),
    );
  }, []);

  const onTransmitterConnectivityChanged = useCallback((connected) => {
    console.log(`onTransmitterConnectivityChanged: ${connected}`);
    setConnected(connected);
  }, []);

  const onReceiverConnectivityChanged = useCallback((identifier, connected) => {
    console.log(`onReceiverConnectivityChanged ${identifier}: connected ${connected}`);
    setConnectedMap(
      produce((draft) => {
        const connectedReceiver = draft[identifier];
        if (!connectedReceiver) {
          draft[identifier] = connected;
        }
        draft[identifier] = connected;
      }),
    );
  }, []);

  const buildViewSessionState = async (
    sessionData,
    setConnectedMap,
    syncStage,
    setDesktopAgentProvisioned,
    setVolumeMap,
    updateMeasurements,
  ) => {
    if (syncStage !== null && sessionData != null) {
      let errorCode;
      // initialize connection and volume, receivers map based on the sessionData state
      setVolumeMap({});
      setReceiversMap({});

      if (sessionData.receivers) {
        sessionData.receivers.forEach(async (receiver) => {
          setConnectedMap(
            produce((draft) => {
              const connectedReceiver = draft[receiver.identifier];
              if (!connectedReceiver) {
                draft[receiver.identifier] = undefined;
              }
            }),
          );

          // Volume
          let volumeValue;
          [volumeValue, errorCode] = await syncStage.getReceiverVolume(receiver.identifier);
          errorCodeToSnackbar(errorCode);

          setVolumeMap(
            produce((draft) => {
              draft[receiver.identifier] = volumeValue;
            }),
          );

          setReceiversMap(
            produce((draft) => {
              draft[receiver.identifier] = receiver;
            }),
          );
        });
      }

      await updateMeasurements();

      setIsRecording(sessionData.isRecording);
    }
  };

  const onWebsocketReconnected = useCallback(async () => {
    console.log('onWebsocketReconnected in session');
    const [data, errorCode] = await syncStage.session();
    errorCodeToSnackbar(errorCode);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      navigate(PathEnum.SETUP);
      setDesktopAgentProvisioned(false);
    } else if (errorCode === SyncStageSDKErrorCode.NOT_IN_SESSION) {
      onSessionOut();
    } else if (errorCode === SyncStageSDKErrorCode.OK) {
      setSessionData(data);
    }

    buildViewSessionState(data, setConnectedMap, syncStage, setDesktopAgentProvisioned, setVolumeMap, updateMeasurements);
  }, [syncStage]);

  const updateMeasurements = async () => {
    if (syncStage === null) {
      return;
    }
    let errorCode;
    let measurements;

    //Tx measurements
    [measurements, errorCode] = await syncStage.getTransmitterMeasurements();
    errorCodeToSnackbar(errorCode);

    if (measurements) {
      setMeasurements({
        delay: measurements.networkDelayMs,
        jitter: measurements.networkJitterMs,
        quality: measurements.quality,
      });
    }
    //Rx measurements
    // console.log(`Receivers map: ${JSON.stringify(receiversMap)}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(receiversMap).forEach(async ([_, receiver]) => {
      let errorCode;
      let measurements;
      [measurements, errorCode] = await syncStage.getReceiverMeasurements(receiver.identifier);
      errorCodeToSnackbar(errorCode);
      if (measurements) {
        setMeasurementsMap(
          produce((draft) => {
            draft[receiver.identifier] = {
              delay: measurements.networkDelayMs,
              jitter: measurements.networkJitterMs,
              quality: measurements.quality,
            };
          }),
        );
      }
    });
  };

  const clearDelegates = () => {
    syncStage.userDelegate = new SyncStageUserDelegate(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  };

  useEffect(() => {
    const initializeSession = async () => {
      console.log('initializeSession');
      if (syncStage !== null && desktopAgentProvisioned) {
        const sessionCodeFromPath = extractSessionCode(location.pathname);
        setBackdropOpen(true);
        const [data, errorCode] = await syncStage.session();
        if (errorCode === SyncStageSDKErrorCode.OK) {
          console.log('Desktop agent in session');

          persistSessionCode(sessionCodeFromPath);
          if (data.sessionCode?.replace(/-/g, '').toLowerCase() !== sessionCodeFromPath.replace(/-/g, '').toLowerCase()) {
            console.log(
              // eslint-disable-next-line
              `${data.sessionCode} sessionCode differs from the one in the path ${location.pathname}. Leaving session and joining the one from the path`,
            );
            clearDelegates();

            const errorCodeLeave = await syncStage.leave();
            if (errorCodeLeave === SyncStageSDKErrorCode.OK) {
              const [data, errorCodeJoin] = await syncStage.join(
                sessionCodeFromPath,
                nickname,
                selectedServer.zoneId,
                selectedServer.studioServerId,
                nickname,
              );
              if (errorCodeJoin === SyncStageSDKErrorCode.OK) {
                setSessionData(data);
                setBackdropOpen(false);
                return undefined;
              }
            }

            console.log('Could not join or leave session in initializeSession method');
            if (selectedServer) {
              navigate(PathEnum.SESSIONS_JOIN);
            } else if (nickname) {
              navigate(PathEnum.LOCATION);
            } else {
              navigate(PathEnum.SESSION_NICKNAME);
            }
            setBackdropOpen(false);
            return undefined;
          } else {
            setSessionData(data);
            console.log('Opened session screen with the same session code as the one in the Desktop Agent');
          }
        } else if (errorCode !== SyncStageSDKErrorCode.OK && selectedServer !== null) {
          console.log('Desktop Agent not in session. Joining the session from the path');
          const [data, errorCode] = await syncStage.join(
            sessionCodeFromPath,
            nickname,
            selectedServer.zoneId,
            selectedServer.studioServerId,
            nickname,
          );
          if (errorCode === SyncStageSDKErrorCode.OK) {
            console.log('Remaining on session Screen');
            setSessionData(data);
            setBackdropOpen(false);
            return undefined;
          }

          console.log('Could not join session from the path.');
          if (nickname) {
            navigate(PathEnum.LOCATION);
            setBackdropOpen(false);
            return undefined;
          } else {
            navigate(PathEnum.SESSION_NICKNAME);
            setBackdropOpen(false);
            return undefined;
          }
        }
        setBackdropOpen(false);
      }
    };

    initializeSession();
  }, [syncStage, desktopAgentProvisioned, location.pathname]);

  useEffect(() => {
    // Set up the interval
    if (updateMeasurementsIntervalId) {
      clearInterval(updateMeasurementsIntervalId);
    }
    console.log('updateMeasurements interval init');
    const localIntervalId = setInterval(async () => {
      await updateMeasurements();
    }, MEASUREMENTS_INTERVAL_MS);

    setUpdateMeasurementsIntervalId(localIntervalId);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(updateMeasurementsIntervalId);
    };
  }, [receiversMap]);

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        console.log('Updating delegates');
        syncStage.userDelegate = new SyncStageUserDelegate(
          onUserJoined,
          onUserLeft,
          onUserMuted,
          onUserUnmuted,
          onRecordingStarted,
          onRecordingStopped,
          onSessionOut,
        );
        syncStage.connectivityDelegate = new SyncStageConnectivityDelegate(onTransmitterConnectivityChanged, onReceiverConnectivityChanged);
        syncStage.updateOnWebsocketReconnected(onWebsocketReconnected);

        const [mutedState, errorCode] = await syncStage.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }
        await buildViewSessionState(sessionData, setConnectedMap, syncStage, setDesktopAgentProvisioned, setVolumeMap, updateMeasurements);
      }
    }
    executeAsync();
    return () => {
      if (syncStage !== null) {
        syncStage.userDelegate = null;
        syncStage.connectivityDelegate = null;
      }
    };
  }, [syncStage, sessionData]);

  useEffect(() => {
    //on component unmount.
    return () => {
      if (syncStage !== null) {
        syncStage.leave();
      }
    };
  }, []);

  return (
    <div style={inSession ? mountedStyle : unmountedStyle}>
      <SessionWrapper>
        <Grid item container flexDirection="row" rowGap={2} columnGap={8} alignItems="flex-start" style={{ marginBottom: '90px' }}>
          {!!sessionData && !!sessionData.transmitter && (
            <UserCard transmitter {...sessionData.transmitter} connected={connected} {...measurements} />
          )}
          {Object.entries(receiversMap).map(([identifier, connection]) => (
            <UserCard
              {...connection}
              {...measurementsMap[identifier]}
              connected={connectedMap[identifier]}
              volume={volumeMap[identifier]}
              onVolumeChanged={async (volume) => {
                setVolumeMap({
                  ...volumeMap,
                  [identifier]: volume,
                });
              }}
              onVolumeChangeCommited={async (volume) => {
                syncStage.changeReceiverVolume(identifier, volume);
                setVolumeMap({
                  ...volumeMap,
                  [identifier]: volume,
                });
              }}
            />
          ))}
          <InviteOthers sessionCode={sessionCode} />
        </Grid>
        <div id="footer">
          <Grid container direction="column" justifyContent="center" alignItems="center" style={{ margin: 0, padding: 0 }}>
            {isRecording ? (
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                style={{ margin: 0, paddingTop: '8px', paddingBottom: '4px', height: '32px', backgroundColor: theme.recordingBackground }}
                spacing={2}
              >
                <span id="redcircle"></span>
                <p
                  style={{
                    fontSize: '24px',
                  }}
                >
                  Recording
                </p>
              </Grid>
            ) : (
              <></>
            )}

            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              style={{ margin: 0, paddingTop: '4px' }}
              spacing={2}
            >
              <Grid item style={{ paddingRight: '32px' }}>
                <Button
                  style={{ color: theme.onSurfaceVariant }}
                  onClick={async () => {
                    clearInterval(updateMeasurementsIntervalId);
                    await onLeaveSession();
                  }}
                >
                  <CallEndIcon />
                </Button>
              </Grid>
              <Grid item style={{ paddingRight: '32px' }}>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={onMutedToggle}>
                  {muted ? <MicOffIcon /> : <Mic />}
                </Button>
              </Grid>
              <Grid item>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={() => setSettingsOpened(true)}>
                  <MoreVertIcon />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </SessionWrapper>
      <Modal open={settingsOpened} onClose={() => setSettingsOpened(false)}>
        <Box sx={modalStyle}>
          <Grid container direction="column" justifyContent="flex-start" alignItems="center">
            <Grid container direction="row" justifyContent="space-between" alignItems="center" style={{ padding: '16px' }}>
              <Typography variant="h4" component="h4">
                Settings
              </Typography>
              <Button style={{ color: theme.onSurfaceVariant }} onClick={() => setSettingsOpened(false)}>
                <CloseIcon />
              </Button>
            </Grid>
            <Grid item style={{ width: '100%', paddingLeft: 32 }}>
              <Typography variant="h5" component="h5">
                Recording
              </Typography>
            </Grid>

            <Grid item>
              <ButtonContained
                onClick={() => {
                  if (isRecording) {
                    onStopRecording();
                  } else {
                    onStartRecording();
                  }
                }}
              >
                {isRecording ? 'Stop recording' : 'Start recording'}
              </ButtonContained>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};

export default Session;
