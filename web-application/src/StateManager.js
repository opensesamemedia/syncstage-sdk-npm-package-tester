import { Amplify } from 'aws-amplify';
import { signOut as amplifySignOut, getCurrentUser } from 'aws-amplify/auth';

import { get } from 'aws-amplify/api';

import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { errorCodeToSnackbar, willJwtBeExpiredIn, extractSessionCode, SESSION_PATH_REGEX } from './utils';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import { Online } from 'react-detect-offline';
import { fetchSyncStageToken } from './apiHandler';

import AppWrapper from './App.styled';
import { PathEnum } from './router/PathEnum';
import RoutesComponent from './router/RoutesComponent';
import './ui/animationStyles.css';
import SyncStageDesktopAgentDelegate from './SyncStageDesktopAgentDelegate';

import SyncStage, { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import modalStyle from './ui/ModalStyle';
import Navigation from './components/Navigation/Navigation';

const StateManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userJwt, setUserJwt] = useState(null);
  const [syncStageJwt, setSyncStageJwt] = useState(localStorage.getItem('syncStageJwt') ?? '');
  const [syncStage, setSyncStage] = useState(null);
  const [syncStageSDKVersion, setSyncStageSDKVersion] = useState();
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') ?? '');
  const [sessionCode, setSessionCode] = useState(localStorage.getItem('sessionCode') ?? '');
  const [sessionCodeFromPath, setSessionCodeFromPath] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [selectedServer, setSelectedServer] = useState(JSON.parse(localStorage.getItem('selectedServer')) ?? null);

  const [backdropOpen, setBackdropOpen] = useState(false);

  const [desktopConnected, setDesktopConnected] = useState(false);
  const [desktopConnectedTimeout, setDesktopConnectedTimeout] = useState(false);

  const [desktopProvisioned, setDesktopProvisioned] = useState(false);
  const [automatedLocationSelection, setAutomatedLocationSelection] = useState(true);
  const [locationSelected, setLocationSelected] = useState(false);

  const [desktopAgentAquired, setDesktopAgentAquired] = useState(false);

  const [desktopAgentProtocolHandler, setDesktopAgentProtocolHandler] = useState('');

  const nicknameSetAndProvisioned = nickname && syncStageJwt;
  const inSession = SESSION_PATH_REGEX.test(location.pathname);

  const persistSessionCode = (sessionCode) => {
    localStorage.setItem('sessionCode', sessionCode);
    setSessionCode(sessionCode);
  };

  if (sessionCodeFromPath && sessionCodeFromPath !== sessionCode) {
    persistSessionCode(sessionCodeFromPath);
  }

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
    if (process.env.REACT_APP_BACKEND_BASE_PATH !== undefined) {
      const tokenResponse = await fetchSyncStageToken(userJwt);
      jwt = tokenResponse.jwt;
    }
    // use amplify backend
    else {
      jwt = await amplifyFetchSyncStageToken();
    }

    return jwt;
  };

  const setDesktopConnectedTimeoutIfNotConnected = () => {
    if (!desktopConnected) {
      setDesktopConnectedTimeout(true);
    }
  };

  useEffect(() => {
    console.log(`Current location: ${location.pathname}`);
    setSessionCodeFromPath(extractSessionCode(location.pathname));
    console.log(`Code: ${sessionCodeFromPath}`);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDesktopConnectedTimeoutIfNotConnected();
    }, 5000);

    // Clean up the timeout to avoid memory leaks
    return () => clearTimeout(timeout);
  }, []);

  const navigateIfLoading = (step) => {
    if (location.pathname === `${PathEnum.LOADING}`) {
      navigate(step);
    }
  };

  useEffect(() => {
    const confirmAmplifyUserSignedIn = async () => {
      if (process.env.REACT_APP_BACKEND_BASE_PATH === undefined) {
        try {
          console.log('Reading amplify config');
          const amplifyconfig = await import('./amplifyconfiguration.json');
          Amplify.configure(amplifyconfig.default);

          let currentUser = null;

          try {
            currentUser = await getCurrentUser();
          } catch (error) {
            console.log('Could not fetch current user: ', error);
          }

          return !!currentUser; // Return true if currentUser is truthy, false otherwise
        } catch (error) {
          console.error('Error importing amplifyconfiguration.json:', error);
        }
      }
      return false; // Default value if REACT_APP_BACKEND_BASE_PATH is defined
    };

    console.log(`REACT_APP_BACKEND_BASE_PATH: ${process.env.REACT_APP_BACKEND_BASE_PATH}`);

    const initializeSignIn = async () => {
      let amplifySignedIn = false;
      if (process.env.REACT_APP_BACKEND_BASE_PATH === undefined) {
        amplifySignedIn = await confirmAmplifyUserSignedIn();
        setIsSignedIn(amplifySignedIn);
      }
      if (!isSignedIn && !amplifySignedIn) {
        // Not signed in neither in amplify nor in docker-compose backend
        navigate(PathEnum.LOGIN);
        console.log('User needs to be authenticated.');
      }
    };
    navigate(PathEnum.LOADING);
    initializeSignIn();
  }, []);

  useEffect(() => {
    const fetchJWT = async () => {
      let jwt = syncStageJwt;

      const fiveMinutesInSeconds = 5 * 60;
      if (willJwtBeExpiredIn(jwt, fiveMinutesInSeconds)) {
        console.log(`SyncStage jwt will expire in the next ${fiveMinutesInSeconds}s, refetching token`);
        jwt = await onJwtExpired();
        persistSyncStageJwt(jwt);
      } else {
        console.log('Found valid SyncStage jwt secret.');
      }
      return jwt;
    };

    const initializeSyncStage = async () => {
      if (syncStage === null) {
        console.log('initializeSyncStage useEffect syncStage instantiation');

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
      } else if (syncStage !== null && desktopConnected && isSignedIn === true && desktopConnectedTimeout === false) {
        console.log('initializeSyncStage useEffect syncStage init');
        const jwt = await fetchJWT();
        console.log(`jwt to init ${jwt}`);

        const initErrorCode = await syncStage.init(jwt);
        if (initErrorCode == SyncStageSDKErrorCode.OK) {
          setDesktopProvisioned(true);
        } else {
          console.log('Could not init SyncStage, invalid jwt');
          navigateIfLoading(PathEnum.LOGIN);
          return undefined;
        }

        if (sessionCodeFromPath && nickname) {
          const [errorCode] = await syncStage.session();
          if (errorCode === SyncStageSDKErrorCode.OK) {
            console.log('Switching to session Screen');

            navigateIfLoading(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCodeFromPath}`);
            return undefined;
          } else if (errorCode === SyncStageSDKErrorCode.NOT_IN_SESSION && selectedServer !== null) {
            const [errorCode] = await syncStage.join(sessionCode, nickname, selectedServer.zoneId, selectedServer.studioServerId, nickname);
            if (errorCode === SyncStageSDKErrorCode.OK) {
              console.log('Switching to session Screen');

              navigateIfLoading(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCodeFromPath}`);
              return undefined;
            }

            console.log('Could not join session');
            if (selectedServer) {
              navigateIfLoading(PathEnum.SESSIONS_JOIN);
              return undefined;
            } else if (nickname) {
              navigateIfLoading(PathEnum.LOCATION);
              return undefined;
            } else {
              navigateIfLoading(PathEnum.SESSION_NICKNAME);
              return undefined;
            }
          }
        } else {
          if (selectedServer) {
            navigateIfLoading(PathEnum.SESSIONS_JOIN);
            return undefined;
          } else if (nickname) {
            navigateIfLoading(PathEnum.LOCATION);
            return undefined;
          } else {
            navigateIfLoading(PathEnum.SESSION_NICKNAME);
            return undefined;
          }
        }
      } else if (syncStage !== null && desktopConnectedTimeout && isSignedIn) {
        console.log('initializeSyncStage useEffect desktopConnectedTimeout');
        console.log('Desktop connected timeout, going to setup screen');
        navigate(PathEnum.SETUP);
        return undefined;
      }
    };
    initializeSyncStage();
  }, [syncStage, desktopConnected, desktopConnectedTimeout, isSignedIn]);

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch (error) {
      console.log('error signing out from aplify backend: ', error);
    }

    setUserJwt(null);
    setIsSignedIn(false);
    persistSyncStageJwt('');
    navigate(PathEnum.LOGIN);
    setDesktopProvisioned(false);
    await syncStage.leave();
    setSessionData(null);
  };

  const setNicknameAndSave = (nickname) => {
    localStorage.setItem('nickname', nickname);
    setNickname(nickname);
  };

  const goToSetupPageOnUnauthorized = () => {
    navigate(PathEnum.SETUP);
    setDesktopProvisioned(false);
    setBackdropOpen(false);
  };

  const persistSyncStageJwt = (jwt) => {
    setSyncStageJwt(jwt);
    localStorage.setItem('syncStageJwt', jwt);
  };

  const persistSelectedServer = (server) => {
    setSelectedServer(server);
    localStorage.setItem('selectedServer', JSON.stringify(server));
  };

  async function fetchNewSyncStageToken() {
    let jwt;
    // use local docke-compose backend
    if (process.env.REACT_APP_BACKEND_BASE_PATH !== undefined) {
      const tokenResponse = await fetchSyncStageToken(userJwt);
      jwt = tokenResponse.jwt;
    }

    // use amplify backend
    else {
      jwt = await amplifyFetchSyncStageToken();
    }
    persistSyncStageJwt(jwt);
    const errorCode = await syncStage.init(jwt);
    return errorCode;
  }

  const onProvisionSubmit = async () => {
    setBackdropOpen(true);
    const errorCode = await fetchNewSyncStageToken();
    errorCodeToSnackbar(errorCode, 'Authorized to SyncStage services');
    setBackdropOpen(false);
    if (errorCode === SyncStageSDKErrorCode.OK) {
      navigate(PathEnum.SESSION_NICKNAME);
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
      navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCode}`);
    }
  };

  const onCreateSession = async () => {
    setBackdropOpen(true);
    const [createData, errorCode] = await syncStage.createSession(selectedServer.zoneId, selectedServer.studioServerId, nickname);
    errorCodeToSnackbar(errorCode, `Created session ${createData.sessionCode}`);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }

    persistSessionCode(createData.sessionCode);

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
        navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${createData.sessionCode}`);
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
    if (selectedServer) {
      navigate(PathEnum.SESSIONS_JOIN);
    } else {
      navigate(PathEnum.LOCATION);
    }
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

  const sharedState = {
    syncStage,
    syncStageSDKVersion,
    nickname,
    setNicknameAndSave,
    sessionCode,
    persistSessionCode,
    sessionData,
    setSessionData,
    selectedServer,
    persistSelectedServer,
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

  return (
    <AppContext.Provider value={sharedState}>
      <AppWrapper inSession={inSession}>
        <div className="bg" />
        <div className="gradient2" />
        <div className="gradient1" />
        <Navigation
          hidden={!isSignedIn || inSession || location.pathname == `${PathEnum.LOADING}`}
          inSession={inSession}
          nicknameSetAndProvisioned={nicknameSetAndProvisioned}
        />

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
      </AppWrapper>
    </AppContext.Provider>
  );
};

export default StateManager;
