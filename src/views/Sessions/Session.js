import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Grid } from '@mui/material';
import AppContext from '../../AppContext';
import { mountedStyle, unmountedStyle } from '../../ui/AnimationStyles';
import UserCard from '../../components/UserCard/UserCard';
import SessionWrapper from './Session.styled';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Mic } from '@mui/icons-material';
import Button from '@mui/material/Button';
import theme from '../../ui/theme';
import InviteOthers from '../../components/UserCard/InviteOthers';
import { errorCodeToSnackbar } from '../../utils';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import SyncStageUserDelegate from '../../SyncStageUserDelegate';
import SyncStageConnectivityDelegate from '../../SyncStageConnectivityDelegate';
import { enqueueSnackbar } from 'notistack';
import { PathEnum } from '../../router/PathEnum';
import produce from 'immer';

const MEASUREMENTS_INTERVAL_MS = 5000;

const Session = ({ onLeaveSession, inSession }) => {
  const { sessionCode, sessionData, setSessionData, syncStage, setCurrentStep, setDesktopProvisioned } = useContext(AppContext);

  // Transmitter
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [measurements, setMeasurements] = useState({});

  // Receivers
  const [measurementsMap, setMeasurementsMap] = useState({});
  const [volumeMap, setVolumeMap] = useState({});
  const [connectedMap, setConnectedMap] = useState({});
  const [receiversMap, setReceiversMap] = useState({});

  if (!sessionData) {
    setCurrentStep(PathEnum.PROFILE_NICKNAME);
  }

  const onSessionOut = useCallback(() => {
    enqueueSnackbar('You have been disconnected from session');
    setCurrentStep(PathEnum.SESSIONS_JOIN);
  }, [setCurrentStep]);

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
    if (sessionData.transmitter.identifier === connection.identifier || receiversMap[connection.identifier]) {
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
    setCurrentStep,
    setDesktopProvisioned,
    setVolumeMap,
    updateMeasurements,
  ) => {
    if (sessionData != null) {
      let errorCode;
      // initialize connection and volume, receivers map based on the sessionData state
      setVolumeMap({});
      setReceiversMap({});

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
      await updateMeasurements();
    }
  };

  const onDesktopAgentReconnected = useCallback(async () => {
    console.log('onDesktopAgentReconnected in session');
    const [data, errorCode] = await syncStage.session();
    errorCodeToSnackbar(errorCode);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      setCurrentStep(PathEnum.PROFILE_SECRET);
      setDesktopProvisioned(false);
    }

    if (errorCode === SyncStageSDKErrorCode.OK) {
      setSessionData(data);
    }

    buildViewSessionState(data, setConnectedMap, syncStage, setCurrentStep, setDesktopProvisioned, setVolumeMap, updateMeasurements);
  }, []);

  const updateMeasurements = async () => {
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

  useEffect(() => {
    // Set up the interval
    const intervalId = setInterval(async () => {
      await updateMeasurements();
    }, MEASUREMENTS_INTERVAL_MS);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [receiversMap]);

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        syncStage.userDelegate = new SyncStageUserDelegate(onUserJoined, onUserLeft, onUserMuted, onUserUnmuted, onSessionOut);
        syncStage.connectivityDelegate = new SyncStageConnectivityDelegate(onTransmitterConnectivityChanged, onReceiverConnectivityChanged);
        syncStage.updateOnDesktopAgentReconnected(onDesktopAgentReconnected);

        const [mutedState, errorCode] = await syncStage.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }
        await buildViewSessionState(
          sessionData,
          setConnectedMap,
          syncStage,
          setCurrentStep,
          setDesktopProvisioned,
          setVolumeMap,
          updateMeasurements,
        );
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

  return (
    <div style={inSession ? mountedStyle : unmountedStyle}>
      <SessionWrapper>
        <Grid item container flexDirection="row" rowGap={2} columnGap={8} alignItems="flex-start" style={{ marginBottom: '10vh' }}>
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
          <Grid container direction="row" justifyContent="center" alignItems="center" style={{ margin: 0, paddingTop: '4px' }} spacing={2}>
            <Grid item style={{ paddingRight: '32px' }}>
              <Button style={{ color: theme.onSurfaceVariant }} onClick={async () => onLeaveSession()}>
                <CallEndIcon />
              </Button>
            </Grid>
            <Grid item style={{ paddingRight: '32px' }}>
              <Button style={{ color: theme.onSurfaceVariant }} onClick={onMutedToggle}>
                {muted ? <MicOffIcon /> : <Mic />}
              </Button>
            </Grid>
            {/* 
            TODO
            <Grid item>
              <Button style={{ color: theme.onSurfaceVariant }}>
                <MoreVertIcon />
              </Button>
            </Grid> */}
          </Grid>
        </div>
      </SessionWrapper>
    </div>
  );
};

export default Session;
