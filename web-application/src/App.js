import { HashRouter, useLocation } from 'react-router-dom';
import queryString from 'query-string';

import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

import GlobalStyle from './ui/GlobalStyle';
import theme from './ui/theme';
import './ui/animationStyles.css';

import StateManager from './StateManager';
import { GoogleOAuthProvider } from '@react-oauth/google';

const muiTheme = createTheme({
  typography: {
    fontFamily: ['Josefin Sans', 'sans-serif'].join(','),
  },
});

const TokenHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const parsed = queryString.parse(location.hash);
    const accessToken = parsed.access_token;
    const idToken = parsed.id_token;

    if (accessToken && idToken) {
      console.log('Access Token:', accessToken);
      console.log('ID Token:', idToken);
      // You can now store these tokens in your state or context
    }
  }, [location]);

  return null;
};

const App = () => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <GoogleOAuthProvider clientId="426785619041-pvle03qi56vfn3g1s35oo746ps642tm4.apps.googleusercontent.com">
          <SnackbarProvider preventDuplicate maxSnack={2} />
          <HashRouter>
            <TokenHandler />
            <StateManager />
          </HashRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

export default App;
