import { Amplify } from 'aws-amplify';
import { signOut as amplifySignOut, getCurrentUser } from 'aws-amplify/auth';

import { get } from 'aws-amplify/api';

import AppContext from './AppContext';
import { HashRouter } from 'react-router-dom';
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
import { Online } from 'react-detect-offline';
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
  const [isSignedIn, setIsSignedIn] = useState(false);
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

  const [desktopConnected, setDesktopConnected] = useState(false);

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

  const onDesktopAgentConnected = () => {
    setDesktopConnected(true);
  };

  const onDesktopAgentDisconnected = () => {
    setDesktopConnected(false);
  };

  async function amplifyFetchSyncStageToken() {
    try {
      const restOperation = get({
        apiName: 'syncstagewebapi',
        path: '/fetch-token',
      });
      const { body } = await restOperation.response;
      const bodyText = await body.text();
      console.log('GET call succeeded: ', bodyText);
      return bodyText;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  const onJwtExpired = async () => {
    let jwt;
    // use local docke-compose backend
    if (process.env.REACT_APP_BACKEND_BASE_PATH) {
      const tokenResponse = await fetchSyncStageToken(userJwt);
      jwt = tokenResponse.jwt;
    }
    // use amplify backend
    else {
      jwt = await amplifyFetchSyncStageToken();
    }

    return jwt;
  };

  useEffect(() => {
    if (syncStage === null) {
      const desktopAgentDelegate = new SyncStageDesktopAgentDelegate(
        onDesktopAgentAquired,
        onDesktopAgentReleased,
        onDesktopAgentConnected,
        onDesktopAgentDisconnected,
      );
      const ss = new SyncStage(null, null, null, desktopAgentDelegate, onJwtExpired);

      setSyncStageSDKVersion(ss.getSDKVersion());
      setSyncStage(ss);
      setDesktopAgentProtocolHandler(ss.getDesktopAgentProtocolHandler());
    }
  }, [syncStage]);

  useEffect(async () => {
    async function confirmAmplifyUserSignedIn() {
      try {
        const amplifyconfig = await import('./amplifyconfiguration.json');
        Amplify.configure(amplifyconfig.default);

        let currentUser = null;

        try {
          currentUser = await getCurrentUser();
        } catch (error) {
          console.log('Could not fetch current user: ', error);
        }

        if (currentUser) {
          setIsSignedIn(true);
          setCurrentStep(PathEnum.SETUP);
        } else {
          setCurrentStep(PathEnum.LOGIN);
        }
      } catch (error) {
        console.error('Error importing amplifyconfiguration.json:', error);
      }
    }

    console.log(`REACT_APP_BACKEND_BASE_PATH: ${process.env.REACT_APP_BACKEND_BASE_PATH}`);
    // use local docke-compose backend
    if (process.env.REACT_APP_BACKEND_BASE_PATH) {
      if (!isSignedIn) {
        setCurrentStep(PathEnum.LOGIN);
      } else if (!desktopProvisioned) {
        setCurrentStep(PathEnum.SETUP);
      }
    }
    // use amplify backend
    else {
      confirmAmplifyUserSignedIn();
    }
  }, []);

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch (error) {
      console.log('error signing out from aplify backend: ', error);
    }

    setUserJwt(null);
    setIsSignedIn(false);
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
    setDesktopConnected,
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
    isSignedIn,
    setIsSignedIn,
  };

  const goToSetupPageOnUnauthorized = () => {
    setCurrentStep(PathEnum.SETUP);
    setDesktopProvisioned(false);
    setBackdropOpen(false);
  };

  const onProvisionSubmit = async () => {
    setBackdropOpen(true);
    let jwt;
    // use local docke-compose backend
    if (process.env.REACT_APP_BACKEND_BASE_PATH) {
      const tokenResponse = await fetchSyncStageToken(userJwt);
      jwt = tokenResponse.jwt;
    }
    // use amplify backend
    else {
      jwt = await amplifyFetchSyncStageToken();
    }
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
      errorCodeToSnackbar(errorCode);
    }

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
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
      return goToSetupPageOnUnauthorized();
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
      return goToSetupPageOnUnauthorized();
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
      return goToSetupPageOnUnauthorized();
    }
  };

  const onStopRecording = async () => {
    setBackdropOpen(true);
    const errorCode = await syncStage.stopRecording();
    errorCodeToSnackbar(errorCode);
    setBackdropOpen(false);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }
  };

  const inSession = currentStep === PathEnum.SESSIONS_SESSION;
  const nicknameSetAndProvisioned = nickname && syncStageJwt;

  return (
    <AppContext.Provider value={sharedState}>
      <MuiThemeProvider theme={muiTheme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <SnackbarProvider preventDuplicate maxSnack={2} />
          <AppWrapper inSession={inSession}>
            <HashRouter>
              <div className="bg" />
              <div className="gradient2" />
              <div className="gradient1" />
              <Navigation hidden={!isSignedIn || inSession} inSession={inSession} nicknameSetAndProvisioned={nicknameSetAndProvisioned} />

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
              <Online>
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
              </Online>
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
            </HashRouter>
          </AppWrapper>
        </ThemeProvider>
      </MuiThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
