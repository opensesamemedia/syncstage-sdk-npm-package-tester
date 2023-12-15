import React, { useState, useContext } from 'react';
import { login } from '../../apiHandler';
import { Grid } from '@mui/material';
import TextField from '../../components/StyledTextField';
import ButtonContained from '../../components/StyledButtonContained';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import { enqueueSnackbar } from 'notistack';
import { signIn } from 'aws-amplify/auth';

const LoginView = () => {
  const { setCurrentStep, setUserJwt, setIsSignedIn } = useContext(AppContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    // use local docke-compose backend
    if (process.env.REACT_APP_BACKEND_BASE_PATH) {
      try {
        const data = await login(username, password);
        const { token } = data;
        enqueueSnackbar('Login successful');
        setUserJwt(token);
        setIsSignedIn(true);
        setCurrentStep(PathEnum.SETUP);
      } catch (error) {
        console.error('Login failed:', error);
        enqueueSnackbar('Unauthorized');
      }
    }
    // use local docke-compose backend
    else {
      try {
        const { isSignedIn, nextStep } = await signIn({ username, password });
        console.log(`isSignedIn: ${isSignedIn}, nexstStep: ${JSON.stringify(nextStep)}`);
        setIsSignedIn(true);
        setCurrentStep(PathEnum.SETUP);
      } catch (error) {
        console.error('Login failed:', error);
        enqueueSnackbar('Unauthorized');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      </Grid>
    </form>
  );
};

export default LoginView;
