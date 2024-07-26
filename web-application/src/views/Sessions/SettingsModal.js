// FILE: SettingsModal.js
import React, { useContext, useState, useEffect } from 'react';
import { Grid, Box, Modal, Typography, InputLabel, Switch, MenuItem } from '@mui/material';
import Select from '../../components/StyledSelect';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import theme from '../../ui/theme';

import { LatencyOptimizationLevel } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import modalStyle from '../../ui/ModalStyle';
import AppContext from '../../AppContext';

const SettingsModal = ({ open, onClose }) => {
  const {
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
    if (open) {
      fetchSettingsFromAgent(false);
    }
  }, [open]);
  return (
    <Modal id="settings-modal" open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2}>
          <Grid container alignItems="start" xs={12}>
            <Button onClick={onClose} style={{ color: theme.onSurfaceVariant }}>
              <CloseIcon />
            </Button>{' '}
            <Typography variant="h6" style={{ marginTop: 2 }}>
              Settings
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <InputLabel id="input-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Audio Input
            </InputLabel>
            <Select
              labelId="input-device-label"
              id="input-device-select"
              value={selectedInputDevice}
              onClick={(event) => handleInputDeviceChange(event, () => fetchSettingsFromAgent(true))}
              fullWidth
            >
              {inputDevices.map((device) => (
                <MenuItem key={device.identifier} value={device.identifier}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '30px' }} />
          <Grid item xs={12}>
            <InputLabel id="output-device-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Audio Output
            </InputLabel>
            <Select
              labelId="output-device-label"
              id="output-device-select"
              value={selectedOutputDevice}
              onClick={(event) => handleOutputDeviceChange(event, () => fetchSettingsFromAgent(true))}
              fullWidth
            >
              {outputDevices.map((device) => (
                <MenuItem key={device.identifier} value={device.identifier}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '30px' }} />
          <Grid item xs={12}>
            <InputLabel id="latency-optimization-label" style={{ color: 'rgb(197, 199, 200)' }}>
              Latency Optimization Level
            </InputLabel>
            <Select
              labelId="latency-optimization-label"
              id="latency-optimization-select"
              value={latencyOptimizationLevel}
              onChange={handleLatencyLevelChange}
              fullWidth
            >
              {latencyOptimizationLevels.map((levelItem) => (
                <MenuItem key={levelItem.value} value={levelItem.value}>
                  {levelItem.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} style={{ height: '30px' }} />
          <Grid container direction="row" alignItems="center" style={{ padding: 14 }}>
            <Grid container direction="column" alignItems="start" xs={8}>
              <Typography variant="h6">Noise Cancellation</Typography>
              <p style={{ marginTop: 6 }}>Suppress the background noise</p>
              <p style={{ color: '#FFB4AB' }}>Avoid this option in music applications</p>
            </Grid>
            <Grid item xs={4}>
              <Switch checked={noiseCancellationEnabled} onChange={() => handleNoiseCancellationChange(!noiseCancellationEnabled)} />
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
                  <Switch checked={directMonitorEnabled} onChange={() => handleDirectMonitorChange(!directMonitorEnabled)} />
                </Grid>
              </Grid>

              {/* <Grid item xs={12} style={{ height: '30px' }} />
                <Grid item xs={12}>
                  <FormControlLabel
                    labelPlacement="start"
                    control={<Switch checked={gainDisabled} onChange={() => handleDisableGainChange(!gainDisabled)} />}
                    label="Disable Gain"
                  />
                </Grid> */}
            </>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
