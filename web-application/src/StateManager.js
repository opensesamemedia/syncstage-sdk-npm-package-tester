import { Amplify } from 'aws-amplify';
import { signOut as amplifySignOut, getCurrentUser } from 'aws-amplify/auth';

import { get } from 'aws-amplify/api';

import React, { useState, useEffect, useRef } from 'react';
import AppContext from './AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { errorCodeToSnackbar, willJwtBeExpiredIn, SESSION_PATH_REGEX } from './utils';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

import Typography from '@mui/material/Typography';
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

  const [previousLocation, setPreviousLocation] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userJwt, setUserJwt] = useState(null);
  const [syncStageJwt, setSyncStageJwt] = useState(localStorage.getItem('syncStageJwt') ?? '');
  const [syncStage, setSyncStage] = useState(null);
  const [syncStageSDKVersion, setSyncStageSDKVersion] = useState();
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') ?? '');
  const [sessionCode, setSessionCode] = useState(localStorage.getItem('sessionCode') ?? '');
  const [sessionData, setSessionData] = useState(null);
  const [selectedServer, setSelectedServer] = useState(JSON.parse(localStorage.getItem('selectedServer')) ?? null);

  const [backdropOpen, setBackdropOpen] = useState(false);

  const desktopAgentConnectedRef = useRef(false);
  const [desktopAgentConnected, setDesktopAgentConnected] = useState(false);
  const [desktopAgentConnectedTimeoutId, setDesktopAgentConnectedTimeoutId] = useState(false);
  const [desktopAgentConnectedTimeout, setDesktopAgentConnectedTimeout] = useState(false);

  const [desktopAgentProvisioned, setDesktopAgentProvisioned] = useState(false);
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

  const onDesktopAgentAquired = () => {
    setDesktopAgentAquired(true);
  };
  const onDesktopAgentReleased = () => {
    setDesktopAgentAquired(false);
  };

  const onDesktopAgentConnected = () => {
    setDesktopAgentConnected(true);
    clearTimeout(desktopAgentConnectedTimeoutId);
  };

  const onDesktopAgentDisconnected = () => {
    setDesktopAgentConnected(false);
  };

  const onDesktopAgentKeepAlive = () => {
    setDesktopAgentConnected(true);
  };

  const onDesktopAgentLostConnection = () => {
    setDesktopAgentConnected(false);
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

  const setDesktopAgentConnectedTimeoutIfNotConnected = () => {
    if (!desktopAgentConnectedRef.current) {
      console.log('Desktop not connected. Setting timeout');

      setDesktopAgentConnectedTimeout(true);
    }
  };

  useEffect(() => {
    desktopAgentConnectedRef.current = desktopAgentConnected;
  }, [desktopAgentConnected]);

  useEffect(() => {
    console.log('Desktop timeout useEffect');
    const timeoutId = setTimeout(() => {
      setDesktopAgentConnectedTimeoutIfNotConnected();
    }, 5000);

    setDesktopAgentConnectedTimeoutId(timeoutId);

    // Clean up the timeout to avoid memory leaks
    return () => clearTimeout(desktopAgentConnectedTimeoutId);
  }, []);

  // const navigateIfLoading = (step) => {
  //   if (location.pathname === `${PathEnum.LOADING}`) {
  //     navigate(step);
  //   }
  // };

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

          return !!currentUser;
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
    if (!inSession) {
      navigate(PathEnum.LOADING);
    }
    initializeSignIn();
  }, []);

  useEffect(() => {
    if (syncStage === null) {
      console.log('initializeSyncStage useEffect syncStage instantiation');

      const desktopAgentDelegate = new SyncStageDesktopAgentDelegate(
        onDesktopAgentAquired,
        onDesktopAgentReleased,
        onDesktopAgentConnected,
        onDesktopAgentDisconnected,
        onDesktopAgentKeepAlive,
        onDesktopAgentLostConnection,
      );
      const ss = new SyncStage(null, null, null, desktopAgentDelegate, onJwtExpired);

      setSyncStageSDKVersion(ss.getSDKVersion());
      setSyncStage(ss);
      setDesktopAgentProtocolHandler(ss.getDesktopAgentProtocolHandler());
    }
  }, []);

  useEffect(() => {
    const observeLocationChange = async () => {
      if (location.pathname != previousLocation) {
        console.log(`Location changed from ${previousLocation} to ${location.pathname}`);
        setPreviousLocation(location.pathname);
      }
    };
    observeLocationChange();
  }, [location.pathname]);

  useEffect(() => {
    console.log('useEffect [syncStage, desktopAgentConnected, desktopAgentConnectedTimeout, isSignedIn]');
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
      if (syncStage !== null && desktopAgentConnected && isSignedIn === true && desktopAgentConnectedTimeout === false) {
        console.log('initializeSyncStage useEffect syncStage init');
        const jwt = await fetchJWT();
        console.log(`jwt to init ${jwt}`);

        const initErrorCode = await syncStage.init(jwt);
        if (initErrorCode == SyncStageSDKErrorCode.OK) {
          setDesktopAgentProvisioned(true);
        } else {
          console.log('Could not init SyncStage, invalid jwt');
          signOut();
          return undefined;
        }

        if (!(nickname && SESSION_PATH_REGEX.test(location.pathname))) {
          if (selectedServer) {
            console.log('Validating cached selected server');
            const [data, errorCode] = await syncStage.getServerInstances();

            if (errorCode === SyncStageSDKErrorCode.OK) {
              const zoneExists = data.some((obj) => obj.zoneId === selectedServer.zoneId);

              if (zoneExists) {
                console.log(`Zone with zoneId ${selectedServer.zoneId} exists in the server instances array.`);
                navigate(PathEnum.SESSIONS_JOIN);
              } else {
                console.log(
                  `Zone with zoneId ${selectedServer.zoneId} does not exist in the server instances array. ${JSON.stringify(data)}`,
                );
                persistSelectedServer(null);
                navigate(PathEnum.SESSION_NICKNAME);
              }
            } else {
              persistSelectedServer(null);
              navigate(PathEnum.SESSION_NICKNAME);
            }
          } else if (nickname) {
            navigate(PathEnum.LOCATION);
          } else {
            navigate(PathEnum.SESSION_NICKNAME);
          }
          return undefined;
        }
      } else if (syncStage !== null && desktopAgentConnectedTimeout && isSignedIn) {
        console.log('initializeSyncStage useEffect desktopAgentConnectedTimeout');
        console.log('Desktop connected timeout, going to setup screen');
        navigate(PathEnum.SETUP);
        return undefined;
      }
    };
    initializeSyncStage();
  }, [syncStage, desktopAgentConnected, desktopAgentConnectedTimeout, isSignedIn]);

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch (error) {
      console.log('error signing out from aplify backend: ', error);
    }

    setSessionData(null);
    setUserJwt(null);
    setIsSignedIn(false);
    persistSyncStageJwt('');
    navigate(PathEnum.LOGIN);
    setDesktopAgentProvisioned(false);
    await syncStage.leave();
  };

  const setNicknameAndSave = (nickname) => {
    localStorage.setItem('nickname', nickname);
    setNickname(nickname);
  };

  const goToSetupPageOnUnauthorized = () => {
    navigate(PathEnum.SETUP);
    setDesktopAgentProvisioned(false);
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
      setDesktopAgentProvisioned(true);
    } else {
      setDesktopAgentProvisioned(false);
    }
  };

  const onJoinSession = async () => {
    navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCode}`);
  };

  const onCreateSession = async () => {
    setBackdropOpen(true);
    const [createData, errorCode] = await syncStage.createSession(selectedServer.zoneId, selectedServer.studioServerId, nickname);
    errorCodeToSnackbar(errorCode, `Created session ${createData.sessionCode}`);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }

    persistSessionCode(createData.sessionCode);

    navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${createData.sessionCode}`);

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
    desktopAgentConnected,
    setDesktopAgentConnected,
    desktopAgentProvisioned,
    setDesktopAgentProvisioned,
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
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 10,
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {desktopAgentConnected ? (
            <span style={{ fontSize: 10 }}> Desktop Agent Link </span>
          ) : (
            <a target="_blank" href={desktopAgentProtocolHandler}>
              <span style={{ fontSize: 10 }}> Desktop Agent Link </span>
            </a>
          )}
          <span class="dot" style={{ backgroundColor: desktopAgentConnected ? '#2ECC71' : '#C0392B' }}></span>
        </div>
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
