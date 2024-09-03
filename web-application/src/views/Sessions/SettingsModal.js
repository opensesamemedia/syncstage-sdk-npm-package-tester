// FILE: SettingsModal.js
import React, { useContext, useState, useEffect } from 'react';
import { Grid, Box, Modal, Typography, InputLabel, Switch, MenuItem } from '@mui/material';
import Select from '../../components/StyledSelect';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';
import theme from '../../ui/theme';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import { errorCodeToSnackbar } from '../../utils';
import { LatencyOptimizationLevel } from '@opensesamemedia/syncstage';
import modalStyle from '../../ui/ModalStyle';
import AppContext from '../../AppContext';

const SettingsModal = ({ open, onClose, showServerList }) => {
  const {
    syncStageWorkerWrapper,
    noiseCancellationEnabled,
    directMonitorEnabled,
    latencyOptimizationLevel,
    selectedInputDevice,
    selectedOutputDevice,
    inputDevices,
    outputDevices,
    handleInputDeviceChange,
    handleOutputDeviceChange,
    handleLatencyLevelChange,
    handleDirectMonitorChange,
    handleNoiseCancellationChange,
    fetchSettingsFromAgent,
    autoServerInstance,
    setServerInstancesList,
    startBackdropRequest,
    endBackdropRequest,
    serverInstancesList,
    manuallySelectedInstance,
    setManuallySelectedInstance,
  } = useContext(AppContext);

  console.log(`SettingsModal opened: ${open}`);
  const [isWindowsPlatform, setIsWindowsPlatform] = useState(false);

  const latencyOptimizationLevels = [
    {
      name: 'High Quality',
      value: LatencyOptimizationLevel.highQuality,
    },
    {
      name: 'Optimized',
      value: LatencyOptimizationLevel.optimized,
    },
    {
      name: 'Best Performance',
      value: LatencyOptimizationLevel.bestPerformance,
    },
    {
      name: 'Ultra Fast',
      value: LatencyOptimizationLevel.ultraFast,
    },
  ];

  const fetchServerInstancesList = async () => {
    console.log('Fetching server instances list.');
    const requestId = startBackdropRequest();
    const [data, errorCode] = await syncStageWorkerWrapper.getServerInstances();
    console.log(`Available server instances: ${JSON.stringify(data)}.`);
    if (errorCode === SyncStageSDKErrorCode.OK) {
      console.log([autoServerInstance, ...data]);
      setManuallySelectedInstance(autoServerInstance);
      setServerInstancesList([autoServerInstance, ...data]);
    } else {
      errorCodeToSnackbar(errorCode);
    }
    endBackdropRequest(requestId);
  };

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
    if (syncStageWorkerWrapper && serverInstancesList.length === 1) {
      fetchServerInstancesList();
    }
  }, [syncStageWorkerWrapper]);

  useEffect(() => {
    if (open) {
      fetchSettingsFromAgent(false);
    }
  }, [open]);
  return (
    <Modal id="settings-modal" open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Button onClick={onClose} style={{ color: theme.onSurfaceVariant, position: 'absolute', top: '10px', right: '10px' }}>
          <CloseIcon />
        </Button>{' '}
        <Grid container spacing={2}>
          <Typography variant="h6" style={{ marginTop: 2, marginLeft: 16 }}>
            Settings
          </Typography>

          <Grid item xs={12}>
            <InputLabel id="input-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Audio Input
            </InputLabel>
            <Select
              labelId="input-device-label"
              id="input-device-select"
              value={selectedInputDevice}
              onChange={(event) => handleInputDeviceChange(event, () => fetchSettingsFromAgent(true))}
              fullWidth
            >
              {inputDevices.map((device) => (
                <MenuItem key={device.identifier} value={device.identifier}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '20px' }} />
          <Grid item xs={12}>
            <InputLabel id="output-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Audio Output
            </InputLabel>
            <Select
              labelId="output-device-label"
              id="output-device-select"
              value={selectedOutputDevice}
              onChange={(event) => handleOutputDeviceChange(event, () => fetchSettingsFromAgent(true))}
              fullWidth
            >
              {outputDevices.map((device) => (
                <MenuItem key={device.identifier} value={device.identifier}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '20px' }} />
          <Grid item xs={12}>
            <InputLabel id="latency-optimization-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Latency Optimization Level
            </InputLabel>
            <Select
              labelId="latency-optimization-label"
              id="latency-optimization-select"
              value={latencyOptimizationLevel}
              onChange={(event) => {
                if (event.target.value === LatencyOptimizationLevel.ultraFast) {
                  handleNoiseCancellationChange(false);
                }
                handleLatencyLevelChange(event);
              }}
              fullWidth
            >
              {latencyOptimizationLevels.map((levelItem) => (
                <MenuItem key={levelItem.value} value={levelItem.value}>
                  {levelItem.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '20px' }} />
          <Grid container direction="row" alignItems="center" style={{ padding: 14 }}>
            <Grid container direction="column" alignItems="start" xs={8}>
              <Typography variant="h6">Noise Cancellation</Typography>
              <p style={{ marginTop: 6 }}>Suppress the background noise</p>
              <p style={{ color: '#FFB4AB' }}>Avoid this option in music applications</p>
              {latencyOptimizationLevel === LatencyOptimizationLevel.ultraFast && (
                <p>Noise cancellation is not available in Ultra Fast latency optimization level mode.</p>
              )}
            </Grid>
            <Grid item xs={4}>
              <Switch
                disabled={latencyOptimizationLevel === LatencyOptimizationLevel.ultraFast}
                checked={noiseCancellationEnabled}
                onChange={() => handleNoiseCancellationChange(!noiseCancellationEnabled)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.primary,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.primary,
                  },
                }}
              />
            </Grid>
          </Grid>

          {!isWindowsPlatform && (
            <>
              <Grid container direction="row" alignItems="center" style={{ padding: 14 }}>
                <Grid container direction="column" alignItems="start" xs={8}>
                  <Typography variant="h6">Direct Monitor</Typography>
                  <p style={{ marginTop: 6 }}>Allows for listening to the input signal with low latency.</p>
                  <p style={{ color: '#FFB4AB' }}>
                    Make sure you have connected headphones before enabling this option as it can cause acoustic echo.
                  </p>
                </Grid>
                <Grid item xs={4}>
                  <Switch
                    checked={directMonitorEnabled}
                    onChange={() => handleDirectMonitorChange(!directMonitorEnabled)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.primary,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: theme.primary,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              {/* 
              <Grid item xs={12} style={{ height: '20px' }} />
              <Grid item xs={12}>
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={gainDisabled}
                      onChange={() => handleDisableGainChange(!gainDisabled)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.primary,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: theme.primary,
                        },
                      }}
                    />
                  }
                  label="Disable Gain"
                />
              </Grid> */}
            </>
          )}
          {showServerList && (
            <Grid item xs={12}>
              <Grid container direction="row" spacing={2}>
                <Grid item>
                  <InputLabel id="studio-server-label" style={{ color: 'rgb(197, 199, 200)' }}>
                    Studio Server Location
                  </InputLabel>
                </Grid>
                <Grid>
                  <IconButton onClick={fetchServerInstancesList} style={{ color: theme.onSurfaceVariant, paddingTop: '14px' }}>
                    <RefreshIcon />
                  </IconButton>
                </Grid>
              </Grid>
              <Select
                labelId="studio-server-label"
                id="studio-server-select"
                value={manuallySelectedInstance}
                onChange={(e) => setManuallySelectedInstance(e.target.value)}
                fullWidth
              >
                {serverInstancesList.map((server) => (
                  <MenuItem value={server} key={server.studioServerId}>
                    {server.zoneName}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
