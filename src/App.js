import AppContext from './AppContext';
import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { errorCodeToSnackbar } from './utils';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

import GlobalStyle from './ui/GlobalStyle';
import theme from './ui/theme';
import AppWrapper, { Logo } from './App.styled';
import { PathEnum } from './router/PathEnum';
import RoutesComponent from './router/RoutesComponent';
import Menu from './components/Menu/Menu';
import './ui/animationStyles.css';

import SyncStage, { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';

const muiTheme = createTheme({
  typography: {
    fontFamily: ['Josefin Sans', 'sans-serif'].join(','),
  },
});

const App = () => {
  const [syncStage, setSyncStage] = useState(null);
  const [syncStageSDKVersion, setSyncStageSDKVersion] = useState('');
  const [appSecretId, setAppSecretId] = useState(process.env.REACT_APP_SYNCSTAGE_SECRET_ID);
  const [appSecretKey, setAppSecretKey] = useState(process.env.REACT_APP_SYNCSTAGE_SECRET_KEY);
  const [nickname, setNickname] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);

  let startPath = PathEnum.SETUP;

  if (Object.values(PathEnum).includes(window.location.pathname.substring(1))) {
    startPath = window.location.pathname.substring(1);
  }

  const [currentStep, setCurrentStep] = useState(startPath);
  const [backdropOpen, setBackdropOpen] = useState(false);

  const [desktopConnected, setDesktopConnected] = useState(syncStage ? syncStage.isDesktopAgentConnected() : false);

  const [desktopProvisioned, setDesktopProvisioned] = useState(false);
  const [automatedLocationSelection, setAutomatedLocationSelection] = useState(true);
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDesktopConnected(syncStage ? syncStage.isDesktopAgentConnected() : false);
    }, 1000);
    return () => clearInterval(interval);
  }, [syncStage]);

  useEffect(() => {
    if (syncStage === null) {
      const ss = new SyncStage(null, null, null, 18080, process.env.REACT_APP_AGENT_ADDRESS ?? 'ws://localhost');
      setSyncStageSDKVersion(ss.getSDKVersion());
      setSyncStage(ss);
    }
  }, [syncStage]);

  useEffect(() => {
    if (!desktopProvisioned) {
      setCurrentStep(PathEnum.SETUP);
    }
  }, []);

  const sharedState = {
    syncStage,
    syncStageSDKVersion,
    appSecretId,
    setAppSecretId,
    appSecretKey,
    setAppSecretKey,
    nickname,
    setNickname,
    sessionCode,
    setSessionCode,
    sessionData,
    setSessionData,
    selectedServer,
    setSelectedServer,
    currentStep,
    setCurrentStep,
    setBackdropOpen,
    desktopConnected,
    desktopProvisioned,
    setDesktopProvisioned,
    locationSelected,
    setLocationSelected,
    automatedLocationSelection,
    setAutomatedLocationSelection,
  };

  const goToProvisioningPageOnUnauthorized = () => {
    setCurrentStep(PathEnum.PROFILE_SECRET);
    setDesktopProvisioned(false);
    setBackdropOpen(false);
  };

  const onProvisionSubmit = async () => {
    setBackdropOpen(true);
    const errorCode = await syncStage.init(appSecretId, appSecretKey);
    errorCodeToSnackbar(errorCode, 'Authorized');
    setBackdropOpen(false);
    if (errorCode === SyncStageSDKErrorCode.OK) {
      setCurrentStep(PathEnum.LOCATION);
      setDesktopProvisioned(true);
    } else {
      setDesktopProvisioned(false);
    }
  };

  const onJoinSession = async () => {
    setBackdropOpen(true);
    const [data, errorCode] = await syncStage.join(sessionCode, nickname, selectedServer.zoneId, selectedServer.studioServerId, nickname);
    errorCodeToSnackbar(errorCode, `Joined session ${sessionCode}`);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToProvisioningPageOnUnauthorized();
    }

    setBackdropOpen(false);
    if (errorCode === SyncStageSDKErrorCode.OK) {
      setSessionData(data);
      setCurrentStep(PathEnum.SESSIONS_SESSION);
    }
  };

  const onCreateSession = async () => {
    setBackdropOpen(true);
    const [createData, errorCode] = await syncStage.createSession(selectedServer.zoneId, selectedServer.studioServerId, nickname);
    errorCodeToSnackbar(errorCode, `Created session ${createData.sessionCode}`);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToProvisioningPageOnUnauthorized();
    }

    setSessionCode(createData.sessionCode);

    if (errorCode === SyncStageSDKErrorCode.OK) {
      const [joinData, errorCode] = await syncStage.join(
        createData.sessionCode,
        nickname,
        selectedServer.zoneId,
        selectedServer.studioServerId,
        nickname,
      );
      errorCodeToSnackbar(errorCode);
      if (errorCode === SyncStageSDKErrorCode.OK) {
        setSessionData(joinData);
        setCurrentStep(PathEnum.SESSIONS_SESSION);
      }
    }
    setBackdropOpen(false);
  };

  const onLeaveSession = async () => {
    setBackdropOpen(true);
    const errorCode = await syncStage.leave();
    errorCodeToSnackbar(errorCode);
    setBackdropOpen(false);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToProvisioningPageOnUnauthorized();
    }

    setCurrentStep(PathEnum.SESSIONS_JOIN);
    setSessionData(null);
  };

  const inSession = currentStep === PathEnum.SESSIONS_SESSION;
  const profileConfigured = nickname && appSecretId && appSecretKey;

  return (
    <AppContext.Provider value={sharedState}>
      <MuiThemeProvider theme={muiTheme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <SnackbarProvider preventDuplicate />
          <AppWrapper inSession={inSession}>
            <Router>
              <Menu inSession={inSession} profileConfigured={profileConfigured} />

              <div className="bg" />
              <div className="gradient2" />
              <div className="gradient1" />

              <Backdrop
                sx={{
                  color: '#fff',
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={backdropOpen}
                onClick={() => setBackdropOpen(false)}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
              <Logo inSession={inSession} />
              <div className="app-container">
                <div className="app-container-limiter">
                  <RoutesComponent
                    onProvisionSubmit={onProvisionSubmit}
                    onJoinSession={onJoinSession}
                    onLeaveSession={onLeaveSession}
                    onCreateSession={onCreateSession}
                    inSession={inSession}
                  />
                </div>
              </div>
            </Router>
          </AppWrapper>
        </ThemeProvider>
      </MuiThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
