/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useInterval } from 'react-timing-hooks';

import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, MenuItem } from '@mui/material';

import AppContext from '../../AppContext';
import { mountedStyle, unmountedStyle } from '../../ui/AnimationStyles';
import UserCard from '../../components/UserCard/UserCard';
import SessionWrapper from './Session.styled';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckIcon from '@mui/icons-material/Check';
import { Mic } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';

import Button from '@mui/material/Button';
import theme from '../../ui/theme';
import InviteOthers from '../../components/UserCard/InviteOthers';
import { errorCodeToSnackbar, extractSessionCode } from '../../utils';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import SyncStageUserDelegate from '../../SyncStageUserDelegate';
import SyncStageConnectivityDelegate from '../../SyncStageConnectivityDelegate';
import { PathEnum } from '../../router/PathEnum';
import produce from 'immer';
import styled from 'styled-components';
import SettingsModal from './SettingsModal';

const CustomMenuItem = styled(MenuItem)`
  color: ${({ theme }) => theme.onSurfaceVariant};
  &:hover {
    background-color: ${({ theme }) => theme.surfaceVariant2} !important; // Replace with your desired hover color
  }
`;

const MEASUREMENTS_INTERVAL_MS = 5000;

const Session = ({ inSession }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    sessionCode,
    persistSessionCode,
    syncStageWorkerWrapper,
    desktopAgentProvisioned,
    userId,
    nickname,
    startBackdropRequest,
    endBackdropRequest,
    manuallySelectedInstance,
    goToSetupPageOnUnauthorized,
    selectedInputDevice,
    selectedOutputDevice,
    inputDevices,
    outputDevices,
    isRecording,
    setIsRecording,
    fetchSettingsFromAgent,
    handleInputDeviceChange,
    handleOutputDeviceChange,
    handleToggleRecording,
  } = useContext(AppContext);

  const [sessionLoadTime, setSessionLoadTime] = useState(new Date());

  const [localSessionCode, setLocalSessionCode] = useState();
  const [sessionData, setSessionData] = useState(null);

  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const settingsMenuOpened = Boolean(menuAnchorEl);
  const handleMenuSettingsOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuSettingsClose = () => {
    setMenuAnchorEl(null);
  };

  const [ioAnchorEl, setIoMenuAnchorEl] = useState(null);
  const ioMenuOpened = Boolean(ioAnchorEl);
  const handleMenuIoOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIoMenuAnchorEl(event.currentTarget);
  };
  const handleMenuIoClose = () => {
    setIoMenuAnchorEl(null);
  };

  // Transmitter
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [measurements, setMeasurements] = useState({});

  // Receivers
  const [measurementsMap, setMeasurementsMap] = useState({});
  const [volumeMap, setVolumeMap] = useState({});
  const [connectedMap, setConnectedMap] = useState({});
  const [receiversMap, setReceiversMap] = useState({});

  const onLeaveSession = async () => {
    const requestId = startBackdropRequest('onLeaveSession');
    const errorCode = await syncStageWorkerWrapper.leave();
    errorCodeToSnackbar(errorCode);
    endBackdropRequest(requestId);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }
    navigate(PathEnum.SESSIONS_JOIN);
  };

  const updateMeasurements = async () => {
    if (syncStageWorkerWrapper === null) {
      return;
    }
    let errorCode;
    let measurements;

    console.log(`updateMeasurements execution time: ${new Date().toISOString()}`);

    //Tx measurements
    [measurements, errorCode] = await syncStageWorkerWrapper.getTransmitterMeasurements();
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
      [measurements, errorCode] = await syncStageWorkerWrapper.getReceiverMeasurements(receiver.identifier);
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

  // eslint-disable-next-line
  const { start, pause } = useInterval(updateMeasurements, MEASUREMENTS_INTERVAL_MS, { startOnMount: true });

  const onSessionOut = useCallback(() => {
    setSessionData(null);
    navigate(PathEnum.SESSIONS_JOIN);
  }, []);

  const onMutedToggle = useCallback(async () => {
    const mutedState = !muted;
    setMuted(mutedState);
    const errorCode = await syncStageWorkerWrapper.toggleMicrophone(mutedState);
    errorCodeToSnackbar(errorCode);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setMuted(!mutedState);
    }
  }, [syncStageWorkerWrapper, muted]);

  const onUserJoined = async (connection) => {
    console.log('onUserJoined');
    if (syncStageWorkerWrapper === null) {
      return;
    }
    // Not adding self connection and avoid duplicates
    if (
      (sessionData && sessionData.transmitter && sessionData.transmitter.identifier === connection.identifier) ||
      receiversMap[connection.identifier]
    ) {
      console.log("Self connection, won't add to the receivers map");
      return;
    }

    console.log('Adding connection to receivers map: ', connection, receiversMap);

    setReceiversMap(
      produce((draft) => {
        draft[connection.identifier] = connection;
      }),
    );
    console.log('Added connection to receivers map');

    // Volume
    console.log('Setting volume map for: ', connection.identifier);
    const [volumeValue, errorCode] = await syncStageWorkerWrapper.getReceiverVolume(connection.identifier);
    errorCodeToSnackbar(errorCode);
    console.log('Set volume map for: ', connection.identifier);

    setVolumeMap(
      produce((draft) => {
        draft[connection.identifier] = volumeValue;
      }),
    );
  };

  const onUserLeft = useCallback((identifier) => {
    console.log('onUserLeft');

    setReceiversMap(
      produce((draft) => {
        delete draft[identifier];
      }),
    );

    setVolumeMap(
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

  const buildViewSessionState = async (sessionData, setConnectedMap, syncStageWorkerWrapper, setVolumeMap) => {
    if (syncStageWorkerWrapper !== null && sessionData != null) {
      let errorCode;
      // initialize connection and volume, receivers map based on the sessionData state

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
          [volumeValue, errorCode] = await syncStageWorkerWrapper.getReceiverVolume(receiver.identifier);
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

      setIsRecording(sessionData.recordingStatus === 'started');
    }
  };

  const onDesktopAgentReconnected = useCallback(async () => {
    console.log(`onDesktopAgentReconnected in session at time: ${new Date().toISOString()}`);
    if (syncStageWorkerWrapper === null) {
      console.log('syncStageWorkerWrapper is null');
      return;
    }
    const [data, errorCode] = await syncStageWorkerWrapper.session();
    errorCodeToSnackbar(errorCode);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      onSessionOut();
    } else if (errorCode === SyncStageSDKErrorCode.NOT_IN_SESSION && new Date() - sessionLoadTime > 5000) {
      // timeout to allow rejoining session on refresh
      console.log('Not in session, navigating to join session, sessionLoadTime: ', sessionLoadTime);
      onSessionOut();
    } else if (errorCode === SyncStageSDKErrorCode.OK) {
      setSessionData(data);
    }

    await buildViewSessionState(data, setConnectedMap, syncStageWorkerWrapper, setVolumeMap);
  }, [syncStageWorkerWrapper]);

  const clearDelegates = () => {
    if (syncStageWorkerWrapper === null) {
      return;
    }
    syncStageWorkerWrapper.userDelegate = new SyncStageUserDelegate(
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
    );
  };

  useEffect(() => {
    // React will run it when it is time to clean up:
    return () => {
      setSessionLoadTime(new Date());
      setSessionData(null);
      clearDelegates();
    };
  }, []); // Empty array ensures this runs on mount and unmount only

  useEffect(() => {
    const attachDelegates = async () => {
      if (syncStageWorkerWrapper !== null) {
        console.log('Updating delegates');
        syncStageWorkerWrapper.userDelegate = new SyncStageUserDelegate(
          onUserJoined,
          onUserLeft,
          onUserMuted,
          onUserUnmuted,
          onRecordingStarted,
          onRecordingStopped,
          onSessionOut,
        );
        syncStageWorkerWrapper.connectivityDelegate = new SyncStageConnectivityDelegate(
          onTransmitterConnectivityChanged,
          onReceiverConnectivityChanged,
        );
        syncStageWorkerWrapper.updateOnDesktopAgentReconnected(onDesktopAgentReconnected.bind(this));
      }
    };

    const buildState = async (data) => {
      if (syncStageWorkerWrapper !== null) {
        const [mutedState, errorCode] = await syncStageWorkerWrapper.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }
        await buildViewSessionState(data, setConnectedMap, syncStageWorkerWrapper, setVolumeMap);
      }
    };

    console.log('Session useEffect ', syncStageWorkerWrapper, desktopAgentProvisioned, location.pathname);

    const initializeSession = async () => {
      console.log('initializeSession');
      console.log(`Manually selected instance: ${JSON.stringify(manuallySelectedInstance)}`);
      if (syncStageWorkerWrapper !== null && desktopAgentProvisioned) {
        const sessionCodeFromPath = extractSessionCode(location.pathname.toLowerCase().replace(/-/g, ''));
        if (sessionCodeFromPath === localSessionCode) {
          console.log(`Already in the session with the session code: ${sessionCodeFromPath}, no need to join again`);
          return;
        } else if (localSessionCode && localSessionCode.toString().length > 0) {
          console.log(`Leaving the session with the session code: ${localSessionCode}`);
          syncStageWorkerWrapper.leave();
        }

        setLocalSessionCode(sessionCodeFromPath);
        persistSessionCode(sessionCodeFromPath);

        console.log('Joining the session from the path');
        const requestId = startBackdropRequest('joiningSessionFromThePath');

        const [data, errorCode] = await syncStageWorkerWrapper.join(
          sessionCodeFromPath,
          userId,
          nickname,
          manuallySelectedInstance.zoneId,
          manuallySelectedInstance.studioServerId,
        );

        if (errorCode === SyncStageSDKErrorCode.OK) {
          console.log('Remaining on session Screen');
          setSessionData(data);

          await Promise.all([attachDelegates(), fetchSettingsFromAgent(false), buildState(data)]);

          endBackdropRequest(requestId);
          return undefined;
        }

        console.log('Could not join session from the path. errorCode: ', errorCode);
        if (nickname) {
          navigate(PathEnum.SESSIONS_JOIN);
          endBackdropRequest(requestId);
          return undefined;
        } else {
          navigate(PathEnum.SESSION_NICKNAME);
          endBackdropRequest(requestId);
          return undefined;
        }
      }
    };

    initializeSession();
    return () => {
      if (syncStageWorkerWrapper !== null) {
        syncStageWorkerWrapper.userDelegate = null;
        syncStageWorkerWrapper.connectivityDelegate = null;
      }
    };
  }, [syncStageWorkerWrapper, desktopAgentProvisioned, location.pathname]);

  useEffect(() => {
    //on component unmount.
    return () => {
      if (syncStageWorkerWrapper !== null) {
        pause(); // stop measurements
      }
    };
  }, []);

  return (
    <div style={inSession ? mountedStyle : unmountedStyle}>
      <SettingsModal open={settingsModalOpened} onClose={() => setSettingsModalOpened(false)} />

      <SessionWrapper>
        <Grid item container flexDirection="row" rowGap={2} columnGap={8} alignItems="flex-start" style={{ marginBottom: '90px' }}>
          {!!sessionData && !!sessionData.transmitter && (
            <UserCard
              transmitter
              {...sessionData.transmitter}
              connected={connected ? connected.toString() : undefined}
              {...measurements}
              key={sessionData.transmitter.identifier}
            />
          )}
          {Object.entries(receiversMap).map(([identifier, connection]) => (
            <UserCard
              {...connection}
              {...measurementsMap[identifier]}
              connected={connectedMap[identifier] ? connectedMap[identifier].toString() : undefined}
              volume={volumeMap[identifier]}
              onVolumeChanged={async (volume) => {
                setVolumeMap({
                  ...volumeMap,
                  [identifier]: volume,
                });
              }}
              onVolumeChangeCommited={async (volume) => {
                syncStageWorkerWrapper.changeReceiverVolume(identifier, volume);
                setVolumeMap({
                  ...volumeMap,
                  [identifier]: volume,
                });
              }}
              key={identifier}
            />
          ))}
          {sessionData && sessionData.transmitter ? <InviteOthers sessionCode={sessionCode} /> : <></>}
        </Grid>
        <div id="footer">
          <Grid container direction="column" justifyContent="center" alignItems="center" style={{ margin: 0, padding: 0 }}>
            {isRecording ? (
              <Grid
                id="recording-row"
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                style={{
                  margin: 0,
                  paddingTop: '8px',
                  paddingBottom: '4px',
                  height: '32px',
                  bottom: '58px',
                  position: 'fixed',
                  width: '100%',
                  backgroundColor: theme.recordingBackground,
                }}
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
              id="footer-buttons"
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              style={{ margin: 0, bottom: '36px', position: 'fixed', height: '32px', width: '100%' }}
              spacing={2}
            >
              <Grid item style={{ paddingRight: '32px' }}>
                <Button
                  style={{ color: theme.onSurfaceVariant }}
                  onClick={async () => {
                    pause(); // stop measurements
                    await onLeaveSession();
                  }}
                >
                  <CallEndIcon />
                </Button>
              </Grid>
              <Grid item>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={onMutedToggle}>
                  {muted ? <MicOffIcon /> : <Mic />}
                </Button>
              </Grid>
              <Grid item style={{ marginLeft: '-24px', paddingRight: '20px' }}>
                <Button
                  style={{ color: theme.onSurfaceVariant }}
                  onClick={async (event) => {
                    handleMenuIoOpen(event);
                    await fetchSettingsFromAgent(false);
                  }}
                >
                  <ExpandLessIcon />
                </Button>
              </Grid>
              <Menu
                id="audio-menu"
                anchorEl={ioAnchorEl}
                open={ioMenuOpened}
                onClose={handleMenuIoClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
                sx={{ mt: '1px', '& .MuiMenu-paper': { backgroundColor: theme.footterColor } }}
              >
                <CustomMenuItem style={{ color: theme.onSurfaceVariant }} disabled={true}>
                  <Mic style={{ marginRight: '10px', color: theme.iconColor }} />
                  Audio Input
                </CustomMenuItem>
                {inputDevices.map((device) => (
                  <CustomMenuItem
                    key={device.identifier}
                    value={device.identifier}
                    style={{ color: theme.onSurfaceVariant }}
                    onClick={(event) => handleInputDeviceChange(event, () => fetchSettingsFromAgent(true))}
                  >
                    {device.identifier === selectedInputDevice ? (
                      <CheckIcon style={{ marginRight: '10px', color: theme.iconColor }} />
                    ) : (
                      <CheckIcon style={{ marginRight: '10px', color: 'transparent' }} />
                    )}
                    {device.name}
                  </CustomMenuItem>
                ))}

                <Divider sx={{ bgcolor: 'secondary.light' }} />

                <CustomMenuItem style={{ color: theme.onSurfaceVariant }} disabled={true}>
                  <VolumeUpIcon style={{ marginRight: '10px', color: theme.iconColor }} />
                  Audio Output
                </CustomMenuItem>
                {outputDevices.map((device) => (
                  <CustomMenuItem
                    key={device.identifier}
                    value={device.identifier}
                    style={{ color: theme.onSurfaceVariant }}
                    onClick={(event) => handleOutputDeviceChange(event, () => fetchSettingsFromAgent(true))}
                  >
                    {device.identifier === selectedOutputDevice ? (
                      <CheckIcon style={{ marginRight: '10px', color: theme.iconColor }} />
                    ) : (
                      <CheckIcon style={{ marginRight: '10px', color: 'transparent' }} />
                    )}
                    {device.name}
                  </CustomMenuItem>
                ))}

                <Divider sx={{ bgcolor: 'secondary.light' }} />

                <CustomMenuItem
                  onClick={() => {
                    handleMenuIoClose();
                    setSettingsModalOpened(true);
                  }}
                  style={{ color: theme.onSurfaceVariant }}
                >
                  <SettingsIcon style={{ marginRight: '10px', color: theme.iconColor }} />
                  Audio Settings
                </CustomMenuItem>
              </Menu>
              <Grid item>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={handleMenuSettingsOpen}>
                  <MoreVertIcon />
                </Button>
                <Menu
                  id="settings-menu"
                  anchorEl={menuAnchorEl}
                  open={settingsMenuOpened}
                  onClose={handleMenuSettingsClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                  sx={{ mt: '1px', '& .MuiMenu-paper': { backgroundColor: theme.footterColor } }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuSettingsClose();
                      handleToggleRecording(!isRecording);
                    }}
                    style={{ color: theme.onSurfaceVariant }}
                  >
                    <RadioButtonChecked style={{ marginRight: '10px', color: theme.iconColor }} />
                    {isRecording ? <>Stop recording</> : <>Start recording</>}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuSettingsClose();
                      setSettingsModalOpened(true);
                    }}
                    style={{ color: theme.onSurfaceVariant }}
                  >
                    <SettingsIcon style={{ marginRight: '10px', color: theme.iconColor }} />
                    Settings
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </SessionWrapper>
    </div>
  );
};
export default Session;
