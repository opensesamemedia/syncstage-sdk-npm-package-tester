import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Grid } from '@mui/material';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import TextField from '../../components/StyledTextField';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import SettingsModal from './SettingsModal';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const JoinSession = ({ onJoinSession, onCreateSession }) => {
  const navigate = useNavigate();

  const { sessionCode, desktopAgentProvisioned, persistSessionCode, fetchSettingsFromAgent, syncStageWorkerWrapper } = useContext(AppContext);

  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  useEffect(() => {
    if (syncStageWorkerWrapper){
      fetchSettingsFromAgent();
    }
    
  }, []);

  return (
    <>
      <SettingsModal open={settingsModalOpened} onClose={() => setSettingsModalOpened(false)} showServerList />

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
          <Grid item>
            <Button
              onClick={() => {
                setSettingsModalOpened(true);
              }}
            >
              <SettingsOutlinedIcon style={{ width: 30, paddingBottom: 2, paddingRight: 10 }} />
              Settings
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default JoinSession;
