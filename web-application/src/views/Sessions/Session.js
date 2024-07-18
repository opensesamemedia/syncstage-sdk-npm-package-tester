/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useInterval } from 'react-timing-hooks';

import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, Box, Modal, Typography, InputLabel, Switch, FormControlLabel, Slider, MenuItem } from '@mui/material';
import Select from '../../components/StyledSelect';

import AppContext from '../../AppContext';
import { mountedStyle, unmountedStyle } from '../../ui/AnimationStyles';
import UserCard from '../../components/UserCard/UserCard';
import SessionWrapper from './Session.styled';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Mic } from '@mui/icons-material';
import Button from '@mui/material/Button';
import theme from '../../ui/theme';
import InviteOthers from '../../components/UserCard/InviteOthers';
import { errorCodeToSnackbar, extractSessionCode } from '../../utils';
import { SyncStageSDKErrorCode, LatencyOptimizationLevel } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import SyncStageUserDelegate from '../../SyncStageUserDelegate';
import SyncStageConnectivityDelegate from '../../SyncStageConnectivityDelegate';
import { PathEnum } from '../../router/PathEnum';
import produce from 'immer';
import modalStyle from '../../ui/ModalStyle';
import { enqueueSnackbar } from 'notistack';

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
  } = useContext(AppContext);

  const [isWindowsPlatform, setIsWindowsPlatform] = useState(false);

  const [sessionLoadTime, setSessionLoadTime] = useState(new Date());

  const [localSessionCode, setLocalSessionCode] = useState();
  const [sessionData, setSessionData] = useState(null);

  const [settingsOpened, setSettingsOpened] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState(false);
  const [gainDisabled, setGainDisabled] = useState(false);
  const [directMonitorEnabled, setDirectMonitorEnabled] = useState(false);
  const [latencyOptimizationLevel, setLatencyOptimizationLevel] = useState(LatencyOptimizationLevel.highQuality);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);

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
    const requestId = startBackdropRequest();
    const errorCode = await syncStageWorkerWrapper.leave();
    errorCodeToSnackbar(errorCode);
    endBackdropRequest(requestId);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }
    navigate(PathEnum.SESSIONS_JOIN);
  };

  const fetchSettingsFromAgent = async (showBackdrop) => {
    let requestId;
    if (showBackdrop) {
      requestId = startBackdropRequest();
    }
    const [settings, errorCode] = await syncStageWorkerWrapper.getSessionSettings();
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      enqueueSnackbar('Failed to get session settings', { variant: 'error' });
    } else {
      setDirectMonitorEnabled(settings.directMonitorEnabled);
      setGainDisabled(settings.disableGain);
      setNoiseCancellationEnabled(settings.noiseCancellationEnabled);
      setLatencyOptimizationLevel(settings.latencyOptimizationLevel);
      setInputDevices(settings.inputDevices);
      setOutputDevices(settings.outputDevices);

      // Find and set the selected input device
      const selectedInput = settings.inputDevices.find((device) => device.selected);
      if (selectedInput) {
        setSelectedInputDevice(selectedInput.identifier);
      }

      // Find and set the selected output device
      const selectedOutput = settings.outputDevices.find((device) => device.selected);
      if (selectedOutput) {
        setSelectedOutputDevice(selectedOutput.identifier);
      }
    }

    if (showBackdrop) {
      endBackdropRequest(requestId);
    }
  };

  const handleOpenSettings = async (opened) => {
    setSettingsOpened(opened);
    await fetchSettingsFromAgent(true);
  };

  const handleToggleRecording = async (enabled) => {
    const requestId = startBackdropRequest();
    let errorCode;
    if (enabled) {
      errorCode = await syncStageWorkerWrapper.startRecording();
    } else {
      errorCode = await syncStageWorkerWrapper.stopRecording();
    }
    errorCodeToSnackbar(errorCode);
    endBackdropRequest(requestId);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }
  };

  const handleNoiseCancellationChange = async (enabled) => {
    const requestId = startBackdropRequest();

    const stateBefore = noiseCancellationEnabled;
    setNoiseCancellationEnabled(enabled);
    const errorCode = await syncStageWorkerWrapper.setNoiseCancellation(enabled);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setNoiseCancellationEnabled(stateBefore);
      enqueueSnackbar('Failed to set noise cancellation', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleDisableGainChange = async (disabled) => {
    const requestId = startBackdropRequest();

    const stateBefore = gainDisabled;
    setGainDisabled(disabled);
    const errorCode = await syncStageWorkerWrapper.setDisableGain(disabled);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setGainDisabled(stateBefore);
      enqueueSnackbar('Failed to set gain', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleDirectMonitorChange = async (enabled) => {
    const requestId = startBackdropRequest();

    const stateBefore = directMonitorEnabled;
    setDirectMonitorEnabled(enabled);
    const errorCode = await syncStageWorkerWrapper.setDirectMonitor(enabled);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setDirectMonitorEnabled(stateBefore);
      enqueueSnackbar('Failed to set direct monitor', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleLatencyLevelChange = async (newLevel) => {
    const requestId = startBackdropRequest();

    const stateBefore = latencyOptimizationLevel;
    setLatencyOptimizationLevel(newLevel);
    const errorCode = await syncStageWorkerWrapper.setLatencyOptimizationLevel(newLevel);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setLatencyOptimizationLevel(stateBefore);
      enqueueSnackbar('Failed to update latency optimization level', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleInputDeviceChange = async (event) => {
    const requestId = startBackdropRequest();

    const identifier = event.target.value;
    const errorCode = await syncStageWorkerWrapper.setInputDevice(identifier);

    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setSelectedInputDevice(identifier);
      enqueueSnackbar('Failed to set output device', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleOutputDeviceChange = async (event) => {
    const requestId = startBackdropRequest();

    const identifier = event.target.value;
    const errorCode = await syncStageWorkerWrapper.setOutputDevice(identifier);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      enqueueSnackbar('Failed to set output device', { variant: 'error' });
      setSelectedOutputDevice(identifier);
    }
    endBackdropRequest(requestId);
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
    const checkPlatform = async () => {
      let platform;

      if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        const uaData = await navigator.userAgentData.getHighEntropyValues(['platform']);
        platform = uaData.platform;
      } else {
        platform = navigator.userAgent;
      }

      setIsWindowsPlatform(/Win/i.test(platform));
    };

    checkPlatform();
  }, []);

  useEffect(() => {
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
        const requestId = startBackdropRequest();

        console.log('Joining the session from the path');
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
  }, [syncStageWorkerWrapper, desktopAgentProvisioned, location.pathname]);

  useEffect(() => {
    async function executeAsync() {
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

        const [mutedState, errorCode] = await syncStageWorkerWrapper.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }
        await buildViewSessionState(sessionData, setConnectedMap, syncStageWorkerWrapper, setVolumeMap);
      }
    }
    executeAsync();
    return () => {
      if (syncStageWorkerWrapper !== null) {
        syncStageWorkerWrapper.userDelegate = null;
        syncStageWorkerWrapper.connectivityDelegate = null;
      }
    };
  }, [syncStageWorkerWrapper, sessionData]);

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
          <InviteOthers sessionCode={sessionCode} />
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
              <Grid item style={{ paddingRight: '32px' }}>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={onMutedToggle}>
                  {muted ? <MicOffIcon /> : <Mic />}
                </Button>
              </Grid>
              <Grid item>
                <Button style={{ color: theme.onSurfaceVariant }} onClick={() => handleOpenSettings(true)}>
                  <MoreVertIcon />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </SessionWrapper>
      <Modal id="settings-modal" open={settingsOpened} onClose={() => setSettingsOpened(false)}>
        <Box sx={modalStyle}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Settings</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={isRecording} onChange={() => handleToggleRecording(!isRecording)} />}
                label="Recording"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={noiseCancellationEnabled} onChange={() => handleNoiseCancellationChange(!noiseCancellationEnabled)} />
                }
                label="Noise Cancellation"
              />
            </Grid>
            {!isWindowsPlatform && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={gainDisabled} onChange={() => handleDisableGainChange(!gainDisabled)} />}
                    label="Disable Gain"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={directMonitorEnabled} onChange={() => handleDirectMonitorChange(!directMonitorEnabled)} />}
                    label="Direct Monitor"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <InputLabel htmlFor="latency-slider" style={{ paddingBottom: '40px', color: 'rgb(197, 199, 200)' }}>
                Latency optimization Level
              </InputLabel>
              <Slider
                defaultValue={latencyOptimizationLevel}
                step={1}
                marks
                min={0}
                max={3}
                valueLabelDisplay="on"
                onChangeCommitted={(_, newValue) => handleLatencyLevelChange(newValue)}
                valueLabelFormat={(value) => ['High quality', 'Optimized', 'Best Performance', 'Ultra Fast'][value]}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel id="input-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
                Audio Input
              </InputLabel>
              <Select
                labelId="input-device-label"
                id="input-device-select"
                value={selectedInputDevice}
                onChange={handleInputDeviceChange}
                fullWidth
              >
                {inputDevices.map((device) => (
                  <MenuItem key={device.identifier} value={device.identifier}>
                    {device.name}
                  </MenuItem>
                ))}{' '}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <InputLabel id="output-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
                Audio Output
              </InputLabel>
              <Select
                labelId="output-device-label"
                id="output-device-select"
                value={selectedOutputDevice}
                onChange={handleOutputDeviceChange}
                fullWidth
              >
                {outputDevices.map((device) => (
                  <MenuItem key={device.identifier} value={device.identifier}>
                    {device.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};

export default Session;
