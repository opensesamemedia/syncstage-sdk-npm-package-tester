import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { login, signInWithGoogle } from '../../apiHandler';
import { Grid, Button } from '@mui/material';
import TextField from '../../components/StyledTextField';
import ButtonContained from '../../components/StyledButtonContained';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import { enqueueSnackbar } from 'notistack';
import GoogleIcon from '@mui/icons-material/Google'; // Import Google icon
import { GoogleLogin } from '@react-oauth/google';

const LoginView = () => {
  const navigate = useNavigate();

  const { setUserJwt, setIsSignedIn, fetchSyncStageToken, startBackdropRequest, endBackdropRequest } = useContext(AppContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (standardLogin, credential) => {
    const requestId = startBackdropRequest();
    // use local docke-compose backend

    try {
      let data;
      if (standardLogin) {
        data = await login(username, password);
      } else {
        data = await signInWithGoogle(credential);
      }
      const { token } = data;
      setUserJwt(token);

      setIsSignedIn(true);
      enqueueSnackbar('Login successful');
      navigate(PathEnum.SETUP);
    } catch (error) {
      console.error('Login failed:', error);
      enqueueSnackbar('Unauthorized');
    }

    endBackdropRequest(requestId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={() => handleSubmit(true, undefined)}>
      <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
        <Grid item>
          <h2>Sign in</h2>
        </Grid>
        <Grid item>
          <TextField label="Username" type="text" value={username} onKeyUp={handleKeyPress} onChange={(e) => setUsername(e.target.value)} />
        </Grid>
        <Grid item>
          <TextField
            label="Password"
            type="password"
            value={password}
            onKeyUp={handleKeyPress}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item>
          <ButtonContained type="submit" onClick={handleSubmit}>
            Login
          </ButtonContained>
        </Grid>
        <Grid item>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              console.log(credentialResponse);
              handleSubmit(false, credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
            locale="en"
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default LoginView;
