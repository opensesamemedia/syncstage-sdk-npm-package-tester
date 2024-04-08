import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const { sessionCode, persistSessionCode, serverInstancesList, manuallySelectedInstance, setManuallySelectedInstance } =
    useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Sessions</h2>
      </Grid>
      <Grid item>
        <p>Enter a session code to join an existing session or to create a new one.</p>
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
          <ButtonContained disabled={sessionCode === ''} onClick={onJoinSession}>
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
          <ButtonContained onClick={onCreateSession}>New session</ButtonContained>
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
    </Grid>
  );
};

export default JoinSession;
