import AppContext from './AppContext';
import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { errorCodeToSnackbar } from './utils';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';

import GlobalStyle from './ui/GlobalStyle';
import theme from './ui/theme';
import AppWrapper, { Logo } from './App.styled';
import { PathEnum } from './router/PathEnum';
import RoutesComponent from './router/RoutesComponent';
import Menu from './components/Menu/Menu';
import './ui/animationStyles.css';
import SyncStageDesktopAgentDelegate from './SyncStageDesktopAgentDelegate';

import SyncStage, { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import Navigation from './components/Navigation/Navigation';

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

  const [desktopAgentAquired, setDesktopAgentAquired] = useState(false);

  const onDesktopAgentAquired = () => {
    setDesktopAgentAquired(true);
  };
  const onDesktopAgentReleased = () => {
    setDesktopAgentAquired(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDesktopConnected(syncStage ? syncStage.isDesktopAgentConnected() : false);
    }, 1000);
    return () => clearInterval(interval);
  }, [syncStage]);

  useEffect(() => {
    if (syncStage === null) {
      const desktopAgentDelegate = new SyncStageDesktopAgentDelegate(onDesktopAgentAquired, onDesktopAgentReleased);
      const ss = new SyncStage(null, null, null, desktopAgentDelegate, 18080, process.env.REACT_APP_AGENT_ADDRESS ?? 'ws://localhost');

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
    if (errorCode === SyncStageSDKErrorCode.OK) {
      enqueueSnackbar(`Joined session ${sessionCode}`);
    } else {
      enqueueSnackbar(`Could not join the session ${sessionCode}`);
    }

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

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    background: theme.surfaceVariant,
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <AppContext.Provider value={sharedState}>
      <MuiThemeProvider theme={muiTheme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <SnackbarProvider preventDuplicate />
          <AppWrapper inSession={inSession}>
            <Router>
              <div className="bg" />
              <div className="gradient2" />
              <div className="gradient1" />
              <Navigation inSession={inSession} profileConfigured={profileConfigured} />

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
              <Modal keepMounted open={desktopAgentAquired}>
                <Box sx={modalStyle}>
                  <Typography variant="h6" component="h2">
                    Desktop Agent in use
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    SyncStage opened in another browser tab. Please switch to that tab or close current one.
                  </Typography>
                </Box>
              </Modal>
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
