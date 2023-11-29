import React, { useState, useContext } from 'react';
import { login } from '../../apiHandler';
import { Grid } from '@mui/material';
import TextField from '../../components/StyledTextField';
import ButtonContained from '../../components/StyledButtonContained';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import { enqueueSnackbar } from 'notistack';

const LoginView = () => {
  const { setCurrentStep, setUserJwt } = useContext(AppContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await login(username, password);
      const { token } = data;
      enqueueSnackbar('Login successful');
      setUserJwt(token);

      setCurrentStep(PathEnum.LOCATION);
    } catch (error) {
      console.error('Login failed:', error);
      enqueueSnackbar('Login failed');
    }
  };

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" spacing={3}>
      <Grid item>
        <TextField label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </Grid>
      <Grid item>
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Grid>
      <Grid item>
        <ButtonContained
          onClick={async () => {
            await handleSubmit();
          }}
        >
          Login
        </ButtonContained>
      </Grid>
    </Grid>
  );
};

export default LoginView;
