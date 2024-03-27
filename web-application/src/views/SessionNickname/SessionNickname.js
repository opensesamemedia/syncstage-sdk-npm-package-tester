import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import TextField from '../../components/StyledTextField';
import ButtonContained from '../../components/StyledButtonContained';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import Button from '../../components/StyledButton';

const SessionNickname = () => {
  const navigate = useNavigate();

  const { nickname, persistNickname } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Profile</h2>
      </Grid>
      <Grid item>
        <p>Please enter your session nickname.</p>
      </Grid>
      <Grid item>
        <TextField label="Nickname" value={nickname} onChange={(e) => persistNickname(e.target.value)} style={{ width: '70%' }} />
      </Grid>
      <Grid item style={{ height: '140px' }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => navigate(PathEnum.SETUP)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            disabled={nickname === ''}
            onClick={() => {
              navigate(PathEnum.SESSIONS_JOIN);
            }}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SessionNickname;
