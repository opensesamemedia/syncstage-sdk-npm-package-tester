import { HashRouter } from 'react-router-dom';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

import GlobalStyle from './ui/GlobalStyle';
import theme from './ui/theme';
import './ui/animationStyles.css';

import StateManager from './StateManager';

const muiTheme = createTheme({
  typography: {
    fontFamily: ['Josefin Sans', 'sans-serif'].join(','),
  },
});

const App = () => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <SnackbarProvider preventDuplicate maxSnack={2} />
        <HashRouter>
          <StateManager />
        </HashRouter>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

export default App;
