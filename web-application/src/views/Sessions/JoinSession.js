import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import { errorCodeToSnackbar } from '../../utils';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Grid } from '@mui/material';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import TextField from '../../components/StyledTextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '../../components/StyledSelect';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';

const JoinSession = ({ onJoinSession, onCreateSession }) => {
  const navigate = useNavigate();

  const {
    sessionCode,
    desktopAgentProvisioned,
    persistSessionCode,
    serverInstancesList,
    manuallySelectedInstance,
    setManuallySelectedInstance,
    syncStageWorkerWrapper,
    autoServerInstance,
    setServerInstancesList,
    startBackdropRequest,
    endBackdropRequest,
  } = useContext(AppContext);

  const fetchServerInstancesList = async () => {
    console.log('Fetching server instances list');
    const requestId = startBackdropRequest();
    const [data, errorCode] = await syncStageWorkerWrapper.getServerInstances();
    console.log(`Available server instances: ${JSON.stringify(data)}`);
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
    if (syncStageWorkerWrapper && serverInstancesList.length === 1) {
      fetchServerInstancesList();
    }
  }, [syncStageWorkerWrapper, desktopAgentProvisioned]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Sessions</h2>
      </Grid>
      <Grid item>
        <p>Create a new session or enter a session code to join an existing session.</p>
      </Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="center" style={{ paddingLeft: '18px' }} gap={3}>
        <Grid item xs>
          <TextField
            label="Session code"
            value={sessionCode}
            fullWidth
            onChange={(e) => persistSessionCode(e.target.value)}
            placeholder="xyz-xyz-xyz"
          />
        </Grid>
        <Grid item>
          <ButtonContained disabled={sessionCode === '' || !desktopAgentProvisioned} onClick={onJoinSession}>
            Join
          </ButtonContained>
        </Grid>
      </Grid>
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <Grid item style={{ height: '30px' }} />
        <Grid item>
          <p>or</p>
        </Grid>
        <Grid item>
          <ButtonContained onClick={onCreateSession} disabled={!desktopAgentProvisioned}>
            New session
          </ButtonContained>
        </Grid>
      </Grid>

      <Grid item style={{ height: '70px' }} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Button
            onClick={() => {
              navigate(PathEnum.SESSION_NICKNAME);
            }}
          >
            Previous
          </Button>
        </Grid>
      </Grid>
      <Grid item style={{ height: '20px' }} />

      <Grid item>
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item>
            <FormControl>
              <span style={{ fontSize: 12 }}>Studio Server location</span>
              <Select
                labelId="region-select-label"
                value={manuallySelectedInstance}
                onChange={(e) => setManuallySelectedInstance(e.target.value)}
              >
                {serverInstancesList.map((server) => (
                  <MenuItem value={server} key={server.studioServerId}>
                    {server.zoneName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <IconButton onClick={fetchServerInstancesList} style={{ color: 'white', paddingTop: '22px' }}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default JoinSession;
