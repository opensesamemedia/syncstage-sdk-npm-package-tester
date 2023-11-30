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
import { fetchSyncStageToken } from './apiHandler';

import GlobalStyle from './ui/GlobalStyle';
import theme from './ui/theme';
import AppWrapper from './App.styled';
import { PathEnum } from './router/PathEnum';
import RoutesComponent from './router/RoutesComponent';
import './ui/animationStyles.css';
import SyncStageDesktopAgentDelegate from './SyncStageDesktopAgentDelegate';

import SyncStage, { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import modalStyle from './ui/ModalStyle';
import Navigation from './components/Navigation/Navigation';

const muiTheme = createTheme({
  typography: {
    fontFamily: ['Josefin Sans', 'sans-serif'].join(','),
  },
});

const App = () => {
  const [userJwt, setUserJwt] = useState(null);
  const [syncStageJwt, setSyncStageJwt] = useState(null);
  const [syncStage, setSyncStage] = useState(null);
  const [syncStageSDKVersion, setSyncStageSDKVersion] = useState('');
  const [nickname, setNickname] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);

  let startPath = PathEnum.LOGIN;

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

  const [desktopAgentProtocolHandler, setDesktopAgentProtocolHandler] = useState('');

  const onDesktopAgentAquired = () => {
    setDesktopAgentAquired(true);
  };
  const onDesktopAgentReleased = () => {
    setDesktopAgentAquired(false);
  };

  const onJwtExpired = async () => {
    const { jwt } = await fetchSyncStageToken(userJwt);
    return jwt;
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
      const ss = new SyncStage(
        null,
        null,
        null,
        desktopAgentDelegate,
        onJwtExpired,
        process.env.REACT_APP_WSS_ADDRESS ?? 'wss://websocket-pipe.sync-stage.com',
      );

      setSyncStageSDKVersion(ss.getSDKVersion());
      setSyncStage(ss);
      setDesktopAgentProtocolHandler(ss.getDesktopAgentProtocolHandler());
    }
  }, [syncStage]);

  useEffect(() => {
    if (!userJwt) {
      setCurrentStep(PathEnum.LOGIN);
    } else if (!desktopProvisioned) {
      setCurrentStep(PathEnum.SETUP);
    }
  }, []);

  const signOut = async () => {
    setUserJwt(null);
    setSyncStageJwt(null);
    setCurrentStep(PathEnum.LOGIN);
    setDesktopProvisioned(false);
    await syncStage.leave();
    setSessionData(null);
  };

  const sharedState = {
    syncStage,
    syncStageSDKVersion,
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
    desktopAgentProtocolHandler,
    setDesktopAgentProtocolHandler,
    userJwt,
    setUserJwt,
    signOut,
  };

  const goToProvisioningPageOnUnauthorized = () => {
    setCurrentStep(PathEnum.LOGIN);
    setDesktopProvisioned(false);
    setBackdropOpen(false);
  };

  const onProvisionSubmit = async () => {
    setBackdropOpen(true);
    const { jwt } = await fetchSyncStageToken(userJwt);
    setSyncStageJwt(jwt);
    const errorCode = await syncStage.init(jwt);
    errorCodeToSnackbar(errorCode, 'Authorized to SyncStage services');
    setBackdropOpen(false);
    if (errorCode === SyncStageSDKErrorCode.OK) {
      setCurrentStep(PathEnum.SESSION_NICKNAME);
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

  const onStartRecording = async () => {
    setBackdropOpen(true);
    const errorCode = await syncStage.startRecording();
    errorCodeToSnackbar(errorCode);
    setBackdropOpen(false);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToProvisioningPageOnUnauthorized();
    }
  };

  const onStopRecording = async () => {
    setBackdropOpen(true);
    const errorCode = await syncStage.stopRecording();
    errorCodeToSnackbar(errorCode);
    setBackdropOpen(false);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToProvisioningPageOnUnauthorized();
    }
  };

  const inSession = currentStep === PathEnum.SESSIONS_SESSION;
  const nicknameSetAndProvisioned = nickname && syncStageJwt;

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
              <Navigation hidden={userJwt === null} inSession={inSession} nicknameSetAndProvisioned={nicknameSetAndProvisioned} />

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
                    onStartRecording={onStartRecording}
                    onStopRecording={onStopRecording}
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
