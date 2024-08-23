import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import { enqueueSnackbar } from 'notistack';

import { GoogleLogin } from '@react-oauth/google';
import { Box, Tabs, Tab, Grid } from '@mui/material';
import { login, signInWithGoogle, signUp } from '../../apiHandler';
import TextField from '../../components/StyledTextField';
import theme from '../../ui/theme';
import { makeStyles } from '@mui/styles';
import ButtonContained from '../../components/StyledButtonContained';

const useStyles = makeStyles(() => ({
  tabRoot: {
    color: theme.text,
    '&.Mui-selected': {
      color: theme.primary,
    },
  },
}));

const LoginView = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const { setUserJwt, setIsSignedIn, startBackdropRequest, endBackdropRequest } = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleSubmitLogin = async (standardLogin, credential) => {
    const requestId = startBackdropRequest();

    try {
      let data;
      if (standardLogin) {
        data = await login(email, password);
      } else {
        data = await signInWithGoogle(credential);
      }
      const { idToken, refreshToken, name, expirationDate } = data;
      setUserJwt(idToken);

      setIsSignedIn(true);
      enqueueSnackbar('Login successful');
      navigate(PathEnum.SETUP);
    } catch (error) {
      console.error('Login failed:', error);
      enqueueSnackbar('Unauthorized');
    }

    endBackdropRequest(requestId);
  };

  const handleSignUp = async () => {
    const requestId = startBackdropRequest();

    try {
      await signUp(name, email, password);
      enqueueSnackbar('Sign up successful', { variant: 'success' });
      enqueueSnackbar('Please check you inbox and verify your email before signing in', { variant: 'info' });
      setTabIndex(0);
    } catch (error) {
      console.log(error);
      console.error('Sign up failed:', error);
      enqueueSnackbar(`Sign up failed, ${error.response.data.error}`, { variant: 'error' });
    }

    endBackdropRequest(requestId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitLogin(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Sign In" classes={{ root: classes.tabRoot }} />
        <Tab label="Sign Up" classes={{ root: classes.tabRoot }} />
      </Tabs>
      <br />
      {tabIndex === 0 && (
        <form onSubmit={() => handleSubmitLogin(true, undefined)}>
          <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
            <Grid item>
              <TextField
                label="Email"
                type="text"
                value={email}
                onKeyUp={handleKeyPress}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item>
              <TextField
                label="Password"
                type="password"
                value={password}
                onKeyUp={handleKeyPress}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item>
              <ButtonContained variant="contained" type="submit" onClick={handleSubmitLogin}>
                Sign In
              </ButtonContained>
            </Grid>
            <Grid item>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  handleSubmitLogin(false, credentialResponse.credential);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                locale="en"
              />
            </Grid>
          </Grid>
        </form>
      )}
      {tabIndex === 1 && (
        <form onSubmit={handleSignUp}>
          <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
            <Grid item>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            </Grid>
            <Grid item>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            </Grid>
            <Grid item>
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            </Grid>
            <Grid item>
              <ButtonContained variant="contained" type="submit" onClick={handleSignUp}>
                Sign Up
              </ButtonContained>
            </Grid>
          </Grid>
        </form>
      )}
    </Box>
  );
};
export default LoginView;
