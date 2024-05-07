/* eslint-disable @typescript-eslint/no-empty-function */
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
import { apiFetchSyncStageToken } from './apiHandler';

import AppWrapper from './App.styled';
import { PathEnum } from './router/PathEnum';
import RoutesComponent from './router/RoutesComponent';
import './ui/animationStyles.css';
import SyncStageDesktopAgentDelegate from './SyncStageDesktopAgentDelegate';
import SyncStageDiscoveryDelegate from './SyncStageDiscoveryDelegate';

import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import modalStyle from './ui/ModalStyle';
import Navigation from './components/Navigation/Navigation';
import SyncStageWorkerWrapper from './syncStageWorkerWrapper';

const StateManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [appLoadTime, setAppLoadTime] = useState(new Date());
  const [previousLocation, setPreviousLocation] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userJwt, setUserJwt] = useState(null);
  const [syncStageJwt, setSyncStageJwt] = useState(localStorage.getItem('syncStageJwt') ?? '');
  const [syncStageWorkerWrapper, setSyncStageWorkerWrapper] = useState(null);
  const [syncStageSDKVersion, setSyncStageSDKVersion] = useState();
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') ?? '');
  const [selectedServerName, setSelectedServerName] = useState(undefined);
  const [sessionCode, setSessionCode] = useState(localStorage.getItem('sessionCode') ?? '');

  const [desktopAgentCompatible, setDesktopAgentCompatible] = useState(null);
  const [desktopAgentCompatibleModalClosed, setDesktopAgentCompatibleModalClosed] = useState(false);

  const desktopAgentConnectedRef = useRef(false);
  const desktopAgentConnectedTimeoutRef = useRef(null);
  const [desktopAgentConnected, setDesktopAgentConnected] = useState(false);
  const [desktopAgentConnectedTimeoutId, setDesktopAgentConnectedTimeoutId] = useState(false);
  const [desktopAgentConnectedTimeout, setDesktopAgentConnectedTimeout] = useState(null);

  const [desktopAgentProvisioned, setDesktopAgentProvisioned] = useState(false);
  const [automatedLocationSelection, setAutomatedLocationSelection] = useState(true);
  const [locationSelected, setLocationSelected] = useState(false);

  const [desktopAgentAquired, setDesktopAgentAquired] = useState(false);

  const [desktopAgentProtocolHandler, setDesktopAgentProtocolHandler] = useState('');
  const [backdropOpen, setBackdropOpen] = useState(false);

  const nicknameSetAndProvisioned = nickname && syncStageJwt;
  const inSession = SESSION_PATH_REGEX.test(location.pathname);
  const [serverInstancesList, setServerInstancesList] = useState([{ zoneId: null, zoneName: 'auto', studioServerId: null }]);
  const [manuallySelectedInstance, setManuallySelectedInstance] = useState(serverInstancesList[0]);

  const persistSessionCode = (sessionCode) => {
    localStorage.setItem('sessionCode', sessionCode);
    setSessionCode(sessionCode);
  };

  const fetchSyncStageToken = async () => {
    let jwt = syncStageJwt;

    const fiveMinutesInSeconds = 5 * 60;
    if (willJwtBeExpiredIn(jwt, fiveMinutesInSeconds)) {
      console.log(`SyncStage jwt will expire in the next ${fiveMinutesInSeconds}s, refetching token`);
      console.log(jwt);
      jwt = await onJwtExpired();
      persistSyncStageJwt(jwt);
    } else {
      console.log('Found valid SyncStage jwt secret.');
    }
    return jwt;
  };

  const initializeSyncStage = async () => {
    console.log(
      // eslint-disable-next-line max-len
      `initializeSyncStage desktopAgentConnected: ${desktopAgentConnected} isSignedIn: ${isSignedIn} desktopAgentConnectedTimeout: ${desktopAgentConnectedTimeout} syncStageWorkerWrapper: `,
      syncStageWorkerWrapper,
    );
    if (syncStageWorkerWrapper !== null && desktopAgentConnected && isSignedIn === true && desktopAgentConnectedTimeout === null) {
      console.log('initializeSyncStage useEffect syncStage init');
      setDesktopAgentCompatible(await syncStageWorkerWrapper.isCompatible());

      const syncStageProvisioned = await syncStageWorkerWrapper.checkProvisionedStatus();
      console.log(`SyncStage provisioned: ${syncStageProvisioned}`);

      const jwt = await fetchSyncStageToken();
      const provision = async () => {
        setBackdropOpen(true);
        const initErrorCode = await syncStageWorkerWrapper.init(jwt);
        setBackdropOpen(false);

        if (initErrorCode == SyncStageSDKErrorCode.OK) {
          if (location.pathname === `${PathEnum.LOADING}`) {
            if (nickname) {
              navigate(PathEnum.SESSIONS_JOIN);
            } else {
              navigate(PathEnum.SESSION_NICKNAME);
            }
          }
        } else {
          console.log('Could not init SyncStage, invalid jwt');
          signOut();
          return undefined;
        }
      };
      if (syncStageProvisioned) {
        const updateErrorCode = await syncStageWorkerWrapper.updateToken(jwt);
        if (updateErrorCode == SyncStageSDKErrorCode.OK) {
          if (location.pathname === `${PathEnum.LOADING}`) {
            if (nickname) {
              navigate(PathEnum.SESSIONS_JOIN);
            } else {
              navigate(PathEnum.SESSION_NICKNAME);
            }
          }
        } else {
          console.log('Could not update SyncStage token');
          return await provision();
        }
      } else {
        return await provision();
      }
    }
    // to the next else if add another condition to check if from the application loaded elapsed no more than 10s
    // if more than 10s, navigate to setup screen
    else if (syncStageWorkerWrapper !== null && desktopAgentConnectedTimeout && isSignedIn) {
      // Get the current time
      let currentTime = new Date();

      // Calculate the time difference in seconds
      let timeDifference = (currentTime - appLoadTime) / 1000;

      // If less than 10 seconds have elapsed, navigate to setup screen
      if (timeDifference < 10) {
        console.log('initializeSyncStage useEffect desktopAgentConnectedTimeout');
        console.log('Desktop connected timeout, going to setup screen');
        navigate(PathEnum.SETUP);
        setBackdropOpen(false);
        return undefined;
      }
    }
  };

  const onDesktopAgentAquired = () => {
    setDesktopAgentAquired(true);
  };
  const onDesktopAgentReleased = () => {
    setDesktopAgentAquired(false);
  };

  const onDesktopAgentConnected = async () => {
    setDesktopAgentConnected(true);
    clearTimeout(desktopAgentConnectedTimeoutId);
    setDesktopAgentConnectedTimeout(null);
  };

  const onDesktopAgentDisconnected = () => {
    setDesktopAgentConnected(false);
    setDesktopAgentProvisioned(false);
  };

  const onDesktopAgentRelaunched = async () => {
    setDesktopAgentProvisioned(false);
    await initializeSyncStage();
  };

  const onDesktopAgentProvisioned = () => {
    setDesktopAgentProvisioned(true);
  };

  const onServerSelected = (serverSelected) => {
    setSelectedServerName(serverSelected.zoneName);
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
      const tokenResponse = await apiFetchSyncStageToken(userJwt);
      jwt = tokenResponse.jwt;
    }
    // use amplify backend
    else {
      jwt = await amplifyFetchSyncStageToken();
    }

    return jwt;
  };

  const setDesktopAgentConnectedTimeoutIfNotConnected = () => {
    console.log(`desktopAgentConnectedTimeoutRef.current: ${desktopAgentConnectedTimeoutRef.current}`);
    if (!desktopAgentConnectedRef.current && desktopAgentConnectedTimeoutRef.current === null) {
      console.log('Desktop not connected. Setting timeout');

      setDesktopAgentConnectedTimeout(true);
    } else {
      setDesktopAgentConnectedTimeout(false);
    }
  };

  useEffect(() => {
    // Update appLoadTime when the component mounts
    setAppLoadTime(new Date());
  }, []);

  useEffect(() => {
    desktopAgentConnectedRef.current = desktopAgentConnected;
  }, [desktopAgentConnected]);

  useEffect(() => {
    desktopAgentConnectedTimeoutRef.current = desktopAgentConnectedTimeout;
  }, [desktopAgentConnectedTimeoutRef]);

  useEffect(() => {
    if (!desktopAgentConnectedTimeoutId) {
      console.log('Desktop timeout useEffect');

      const timeoutId = setTimeout(() => {
        setDesktopAgentConnectedTimeoutIfNotConnected();
      }, 5000);

      setDesktopAgentConnectedTimeoutId(timeoutId);
    }
    return () => clearTimeout(desktopAgentConnectedTimeoutId);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [data, errorCode] = await syncStageWorkerWrapper.getServerInstances();
      console.log(`Available server instances: ${JSON.stringify(data)}`);
      if (errorCode === SyncStageSDKErrorCode.OK) {
        setServerInstancesList((serverInstances) => [...serverInstances, ...data]);
      } else {
        errorCodeToSnackbar(errorCode);
      }
    }
    if (syncStageWorkerWrapper && desktopAgentProvisioned && serverInstancesList.length === 1) {
      fetchData();
    }
  }, [syncStageWorkerWrapper, desktopAgentProvisioned]);

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
    const initWorker = async () => {
      const syncStageDiscoveryDelegate = new SyncStageDiscoveryDelegate(
        (zones) => {
          console.log(JSON.stringify(zones));
        },
        (results) => {
          console.log(JSON.stringify(results));
        },
        onServerSelected,
      );

      const desktopAgentDelegate = new SyncStageDesktopAgentDelegate(
        onDesktopAgentAquired,
        onDesktopAgentReleased,
        onDesktopAgentConnected,
        onDesktopAgentDisconnected,
        onDesktopAgentRelaunched,
        onDesktopAgentProvisioned,
      );

      const ssWorker = new SyncStageWorkerWrapper(null, null, syncStageDiscoveryDelegate, desktopAgentDelegate, onJwtExpired);

      setDesktopAgentProtocolHandler(await ssWorker.getDesktopAgentProtocolHandler());
      setSyncStageSDKVersion(await ssWorker.getSDKVersion());
      setSyncStageWorkerWrapper(ssWorker);
    };

    if (!syncStageWorkerWrapper) {
      initWorker();
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
    initializeSyncStage();
  }, [syncStageWorkerWrapper, desktopAgentConnected, desktopAgentConnectedTimeout, isSignedIn]);

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
    setDesktopAgentProvisioned(false);
    setBackdropOpen(false);
    await syncStageWorkerWrapper.leave();
  };

  const persistNickname = (nickname) => {
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

  const onJoinSession = async () => {
    navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCode}`);
  };

  const onCreateSession = async () => {
    setBackdropOpen(true);
    const [createData, errorCode] = await syncStageWorkerWrapper.createSession(
      nickname,
      manuallySelectedInstance.zoneId,
      manuallySelectedInstance.studioServerId,
    );

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }

    if (errorCode === SyncStageSDKErrorCode.OK) {
      errorCodeToSnackbar(errorCode, `Created session ${createData.sessionCode}`);
      persistSessionCode(createData.sessionCode);

      navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${createData.sessionCode}`);
    }
  };

  const sharedState = {
    syncStageWorkerWrapper,
    fetchSyncStageToken,
    initializeSyncStage,
    syncStageSDKVersion,
    nickname,
    persistNickname,
    sessionCode,
    persistSessionCode,
    setBackdropOpen,
    desktopAgentConnected,
    setDesktopAgentConnected,
    desktopAgentProvisioned,
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
    selectedServerName,
    serverInstancesList,
    manuallySelectedInstance,
    setManuallySelectedInstance,
    goToSetupPageOnUnauthorized,
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
          <span className="dot" style={{ backgroundColor: desktopAgentConnected ? '#2ECC71' : '#C0392B' }}></span>
        </div>
        <Navigation
          hidden={!isSignedIn || inSession || location.pathname == `${PathEnum.LOADING}`}
          inSession={inSession}
          isSignedIn={isSignedIn}
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
                SyncStage Desktop Agent in use
              </Typography>
              <Typography sx={{ mt: 2 }}>
                SyncStage opened in another browser tab. Please switch to that tab or close current one.
              </Typography>
            </Box>
          </Modal>
        </Online>
        <Modal
          open={desktopAgentCompatible === false && !desktopAgentCompatibleModalClosed}
          onClose={() => setDesktopAgentCompatibleModalClosed(true)}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              SyncStage Desktop Agent is incompatible with the current SyncStage SDK version.
            </Typography>
            <Typography sx={{ mt: 2 }}>Please upgrade your SyncStage Desktop Agent to the latest version.</Typography>
          </Box>
        </Modal>
        <div className="app-container">
          <div className="app-container-limiter">
            <RoutesComponent onJoinSession={onJoinSession} onCreateSession={onCreateSession} inSession={inSession} />
          </div>
        </div>
      </AppWrapper>
    </AppContext.Provider>
  );
};

export default StateManager;
