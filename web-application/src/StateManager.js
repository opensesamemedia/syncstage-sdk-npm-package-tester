/* eslint-disable @typescript-eslint/no-empty-function */
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';

import React, { useState, useEffect, useRef } from 'react';
import AppContext from './AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { errorCodeToSnackbar, willJwtBeExpiredIn, SESSION_PATH_REGEX } from './utils';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { enqueueSnackbar } from 'notistack';

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
import { sleep } from './utils';

const getDownloadLink = (version) => {
  const userAgent = window.navigator.userAgent;
  let link = null;
  if (userAgent.indexOf('Mac') !== -1) {
    // eslint-disable-next-line max-len
    if (version) {
      link = `https://public.sync-stage.com/agent/macos/prod/${version}/SyncStageAgent_${version}.dmg`;
    } else {
      link = `https://public.sync-stage.com/agent/macos/prod/0.5.0/SyncStageAgent_0.5.0.dmg`;
    }
  } else if (userAgent.indexOf('Win') !== -1) {
    if (version) {
      // eslint-disable-next-line max-len
      link = `https://public.sync-stage.com/agent/windows/prod/${version}/SyncStageAgent_${version}.exe`;
    } else {
      link = `https://public.sync-stage.com/agent/windows/prod/0.2.0/SyncStageAgent_0.2.0.exe`;
    }
  }
  return link;
};

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
  const [user, setUser] = useState(null);
  const [accessExpired, setAccessExpired] = useState(false);
  const [selectedServerName, setSelectedServerName] = useState(undefined);
  const [sessionCode, setSessionCode] = useState(localStorage.getItem('sessionCode') ?? '');

  const [desktopAgentCompatible, setDesktopAgentCompatible] = useState(null);
  const [desktopAgentLatestCompatibleVersion, setDesktopAgentLatestCompatibleVersion] = useState(null);
  const [downloadLink, setDownloadLink] = useState(getDownloadLink(null));
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
  const [activeRequestIds, setActiveRequestIds] = useState(new Set());
  const [backdropOpen, setBackdropOpen] = useState(false);

  const inSession = SESSION_PATH_REGEX.test(location.pathname);
  const autoServerInstance = { zoneId: null, zoneName: 'auto', studioServerId: null };
  const [serverInstancesList, setServerInstancesList] = useState([autoServerInstance]);
  const [manuallySelectedInstance, setManuallySelectedInstance] = useState(autoServerInstance);

  const [isRecording, setIsRecording] = useState(false);
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState(false);
  const [gainDisabled, setGainDisabled] = useState(false);
  const [directMonitorEnabled, setDirectMonitorEnabled] = useState(false);
  const [latencyOptimizationLevel, setLatencyOptimizationLevel] = useState(null);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);

  const getUserInfo = () => {
    try {
      const decoded = jwtDecode(userJwt);
      const { sub, name } = decoded;
      return { id: sub, name };
    } catch (error) {
      return { id: '', name: '' };
    }
  };

  // Function to start a request
  const startBackdropRequest = () => {
    const requestId = uuidv4();
    const updatedIds = new Set(activeRequestIds).add(requestId);
    console.log('startBackdropRequest', requestId);
    console.log('updatedIds', updatedIds);
    setActiveRequestIds(updatedIds);
    setBackdropOpen(true);
    return requestId;
  };

  // Function to end a request
  const endBackdropRequest = (requestId) => {
    setActiveRequestIds((prevIds) => {
      const updatedIds = new Set(prevIds);
      updatedIds.delete(requestId);
      console.log('endBackdropRequest', requestId);
      console.log('updatedIds', updatedIds);
      if (updatedIds.size === 0) {
        setBackdropOpen(false);
      }
      return updatedIds;
    });
  };

  const persistSessionCode = (sessionCode) => {
    localStorage.setItem('sessionCode', sessionCode);
    setSessionCode(sessionCode);
  };

  const fetchSyncStageToken = async () => {
    console.log('fetchSyncStageToken in StateManager.js');
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
    const requestId = startBackdropRequest();

    if (user)
      console.log(
        // eslint-disable-next-line max-len
        `initializeSyncStage desktopAgentConnected: ${desktopAgentConnected} isSignedIn: ${isSignedIn} desktopAgentConnectedTimeout: ${desktopAgentConnectedTimeout} syncStageWorkerWrapper: `,
        syncStageWorkerWrapper,
      );
    if (
      syncStageWorkerWrapper !== null &&
      desktopAgentConnected &&
      isSignedIn === true &&
      (desktopAgentConnectedTimeout === null || desktopAgentConnectedTimeout === false)
    ) {
      console.log('initializeSyncStage useEffect syncStage init');
      setDesktopAgentCompatible(await syncStageWorkerWrapper.isCompatible());
      const tempVer = await syncStageWorkerWrapper.getLatestCompatibleDesktopAgentVersion();
      setDesktopAgentLatestCompatibleVersion(tempVer);
      setDownloadLink(getDownloadLink(tempVer));

      const syncStageProvisioned = await syncStageWorkerWrapper.checkProvisionedStatus();
      console.log(`SyncStage provisioned: ${syncStageProvisioned}`);

      const jwt = await fetchSyncStageToken();
      const provision = async () => {
        const initErrorCode = await syncStageWorkerWrapper.init(jwt);

        if (initErrorCode == SyncStageSDKErrorCode.OK) {
          if (location.pathname === `${PathEnum.LOADING}` && !inSession) {
            console.log(`In session: ${inSession}`);
            navigate(PathEnum.SESSIONS_JOIN);
          }
        } else {
          console.log('Could not init SyncStage, invalid jwt');
          signOut();
          endBackdropRequest(requestId);
          return undefined;
        }
      };
      if (syncStageProvisioned) {
        const updateErrorCode = await syncStageWorkerWrapper.updateToken(jwt);
        if (updateErrorCode == SyncStageSDKErrorCode.OK) {
          if (location.pathname === `${PathEnum.LOADING}` && !inSession) {
            console.log(`In session: ${inSession}`);

            navigate(PathEnum.SESSIONS_JOIN);
          }
        } else {
          console.log('Could not update SyncStage token');
          await provision();
          endBackdropRequest(requestId);
          return undefined;
        }
      } else {
        await provision();
        endBackdropRequest(requestId);
        return undefined;
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
        endBackdropRequest(requestId);
        return undefined;
      }
    }
    endBackdropRequest(requestId);
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

  const onDesktopAgentDeprovisioned = async () => {
    setDesktopAgentProvisioned(false);
    await initializeSyncStage();
  };

  const onDesktopAgentProvisioned = () => {
    setDesktopAgentProvisioned(true);
  };

  const onServerSelected = (serverSelected) => {
    setSelectedServerName(serverSelected.zoneName);
  };

  const onJwtExpired = async () => {
    console.log('onJwtExpired in StateManager.js');
    let attempts = 0;
    const maxAttempts = 100; // 5 seconds / 50ms = 100 attempts

    while (!userJwt && attempts < maxAttempts) {
      await sleep(50);
      attempts++;
    }
    if (!userJwt) {
      throw new Error('userJwt is not available after 5 seconds');
    }
    try {
      const tokenResponse = await apiFetchSyncStageToken(userJwt);
      const syncStageToken = tokenResponse.syncStageToken;
      return syncStageToken;
    } catch (error) {
      if (error.message === 'AccessExpired') {
        setAccessExpired(true);
        console.error('Access expired:', error);
        enqueueSnackbar('Access expired', { variant: 'error' });
      } else {
        console.error('Error fetching token:', error);
        throw error;
      }
    }
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

  const fetchSettingsFromAgent = async (showBackdrop) => {
    let requestId;
    if (showBackdrop) {
      requestId = startBackdropRequest();
    }
    const [settings, errorCode] = await syncStageWorkerWrapper.getSessionSettings();
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      enqueueSnackbar('Failed to get session settings', { variant: 'error' });
    } else {
      setDirectMonitorEnabled(settings.directMonitorEnabled);
      setGainDisabled(settings.disableGain);
      setNoiseCancellationEnabled(settings.noiseCancellationEnabled);
      setLatencyOptimizationLevel(settings.latencyOptimizationLevel);
      setInputDevices(settings.inputDevices);
      setOutputDevices(settings.outputDevices);

      // Find and set the selected input device
      const selectedInput = settings.inputDevices.find((device) => device.selected);
      if (selectedInput) {
        setSelectedInputDevice(selectedInput.identifier);
      }

      // Find and set the selected output device
      const selectedOutput = settings.outputDevices.find((device) => device.selected);
      if (selectedOutput) {
        setSelectedOutputDevice(selectedOutput.identifier);
      }
    }

    if (showBackdrop) {
      endBackdropRequest(requestId);
    }
  };

  const handleToggleRecording = async (enabled) => {
    const requestId = startBackdropRequest();
    let errorCode;
    if (enabled) {
      errorCode = await syncStageWorkerWrapper.startRecording();
    } else {
      errorCode = await syncStageWorkerWrapper.stopRecording();
    }
    errorCodeToSnackbar(errorCode);
    endBackdropRequest(requestId);

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      return goToSetupPageOnUnauthorized();
    }
  };

  const handleNoiseCancellationChange = async (enabled) => {
    const requestId = startBackdropRequest();

    const stateBefore = noiseCancellationEnabled;
    setNoiseCancellationEnabled(enabled);
    const errorCode = await syncStageWorkerWrapper.setNoiseCancellation(enabled);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setNoiseCancellationEnabled(stateBefore);
      enqueueSnackbar('Failed to set noise cancellation', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  // const handleDisableGainChange = async (disabled) => {
  //   const requestId = startBackdropRequest();

  //   const stateBefore = gainDisabled;
  //   setGainDisabled(disabled);
  //   const errorCode = await syncStageWorkerWrapper.setDisableGain(disabled);
  //   if (errorCode !== SyncStageSDKErrorCode.OK) {
  //     setGainDisabled(stateBefore);
  //     enqueueSnackbar('Failed to set gain', { variant: 'error' });
  //   }
  //   endBackdropRequest(requestId);
  // };

  const handleDirectMonitorChange = async (enabled) => {
    const requestId = startBackdropRequest();

    const stateBefore = directMonitorEnabled;
    setDirectMonitorEnabled(enabled);
    const errorCode = await syncStageWorkerWrapper.setDirectMonitor(enabled);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setDirectMonitorEnabled(stateBefore);
      enqueueSnackbar('Failed to set direct monitor', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleLatencyLevelChange = async (event) => {
    const requestId = startBackdropRequest();
    const stateBefore = latencyOptimizationLevel;
    setLatencyOptimizationLevel(event.target.value);
    const errorCode = await syncStageWorkerWrapper.setLatencyOptimizationLevel(event.target.value);

    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setLatencyOptimizationLevel(stateBefore);
      enqueueSnackbar('Failed to update latency optimization level', { variant: 'error' });
    }
    endBackdropRequest(requestId);
  };

  const handleInputDeviceChange = async (event, onError) => {
    const requestId = startBackdropRequest();
    const stateBefore = selectedInputDevice;

    const identifier = event.target.value;
    const errorCode = await syncStageWorkerWrapper.setInputDevice(identifier);
    setSelectedInputDevice(identifier);

    if (errorCode !== SyncStageSDKErrorCode.OK) {
      enqueueSnackbar('Failed to set input device', { variant: 'error' });
      setSelectedInputDevice(stateBefore);
      onError();
    }
    endBackdropRequest(requestId);
  };

  const handleOutputDeviceChange = async (event, onError) => {
    const stateBefore = selectedOutputDevice;
    const requestId = startBackdropRequest();

    const identifier = event.target.value;
    const errorCode = await syncStageWorkerWrapper.setOutputDevice(identifier);
    setSelectedOutputDevice(identifier);

    if (errorCode !== SyncStageSDKErrorCode.OK) {
      enqueueSnackbar('Failed to set output device', { variant: 'error' });
      setSelectedOutputDevice(stateBefore);
      onError();
    }
    endBackdropRequest(requestId);
  };
  useEffect(() => {
    if (userJwt) {
      setUser(getUserInfo(userJwt));
    }
  }, [userJwt]);

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
    console.log(`REACT_APP_BACKEND_BASE_PATH: ${process.env.REACT_APP_BACKEND_BASE_PATH}`);

    const initializeSignIn = async () => {
      if (!isSignedIn) {
        // Not signed in
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
        onDesktopAgentDeprovisioned,
        onDesktopAgentProvisioned,
      );

      const ssWorker = new SyncStageWorkerWrapper(null, null, syncStageDiscoveryDelegate, desktopAgentDelegate, onJwtExpired);
      ssWorker.updateToken(syncStageJwt);
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
    if (userJwt) {
      initializeSyncStage();
    }
  }, [syncStageWorkerWrapper, desktopAgentConnected, desktopAgentConnectedTimeout, isSignedIn, userJwt]);

  const signOut = async () => {
    setUserJwt(null);
    setIsSignedIn(false);
    persistSyncStageJwt('');
    navigate(PathEnum.LOGIN);
    setDesktopAgentProvisioned(false);
    await syncStageWorkerWrapper.leave();
  };

  const goToSetupPageOnUnauthorized = () => {
    navigate(PathEnum.SETUP);
    setDesktopAgentProvisioned(false);
  };

  const persistSyncStageJwt = (jwt) => {
    setSyncStageJwt(jwt);
    localStorage.setItem('syncStageJwt', jwt);
  };

  const onJoinSession = async () => {
    navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${sessionCode}`);
  };

  const onCreateSession = async () => {
    const requestId = startBackdropRequest();
    const [createData, errorCode] = await syncStageWorkerWrapper.createSession(
      user.id,
      manuallySelectedInstance.zoneId,
      manuallySelectedInstance.studioServerId,
    );

    if (errorCode === SyncStageSDKErrorCode.API_UNAUTHORIZED) {
      endBackdropRequest(requestId);
      return goToSetupPageOnUnauthorized();
    }

    if (errorCode === SyncStageSDKErrorCode.OK) {
      errorCodeToSnackbar(errorCode, `Created session ${createData.sessionCode}`);
      persistSessionCode(createData.sessionCode);

      navigate(`${PathEnum.SESSIONS_SESSION_PREFIX}${createData.sessionCode}`);
    }
    endBackdropRequest(requestId);
  };

  const sharedState = {
    syncStageWorkerWrapper,
    fetchSyncStageToken,
    initializeSyncStage,
    syncStageSDKVersion,
    user,
    sessionCode,
    persistSessionCode,
    startBackdropRequest,
    endBackdropRequest,
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
    getUserInfo,
    signOut,
    isSignedIn,
    setIsSignedIn,
    selectedServerName,
    autoServerInstance,
    serverInstancesList,
    setServerInstancesList,
    manuallySelectedInstance,
    setManuallySelectedInstance,
    goToSetupPageOnUnauthorized,
    downloadLink,
    noiseCancellationEnabled,
    setNoiseCancellationEnabled,
    gainDisabled,
    setGainDisabled,
    fetchSettingsFromAgent,
    directMonitorEnabled,
    setDirectMonitorEnabled,
    latencyOptimizationLevel,
    setLatencyOptimizationLevel,
    selectedInputDevice,
    setSelectedInputDevice,
    selectedOutputDevice,
    setSelectedOutputDevice,
    inputDevices,
    setInputDevices,
    outputDevices,
    setOutputDevices,
    isRecording,
    setIsRecording,
    handleToggleRecording,
    handleNoiseCancellationChange,
    handleDirectMonitorChange,
    handleLatencyLevelChange,
    handleInputDeviceChange,
    handleOutputDeviceChange,
  };

  return (
    <AppContext.Provider value={sharedState}>
      <AppWrapper inSession={inSession}>
        <div className="bg" />
        <div className="gradient1" />
        <div className="gradient2" />
        <div className="black-transparent-bg" />
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
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 10 }}> {getUserInfo() ? getUserInfo().name : ''} </span>
        </div>
        <Navigation
          hidden={!isSignedIn || inSession || location.pathname == `${PathEnum.LOADING}`}
          inSession={inSession}
          isSignedIn={isSignedIn}
          provisioned={syncStageJwt}
        />

        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1000,
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
        <Modal keepMounted open={accessExpired}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Your access to SyncStage has expired
            </Typography>
            <Typography sx={{ mt: 2 }}>
              To extend the access, please contact us at <a href="mailto:contact@example.com">contact@example.com</a>
            </Typography>{' '}
          </Box>
        </Modal>
        <Modal
          open={desktopAgentCompatible === false && !desktopAgentCompatibleModalClosed}
          onClose={() => setDesktopAgentCompatibleModalClosed(true)}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              SyncStage Desktop Agent is incompatible with the current SyncStage SDK version.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              We noticed your Desktop Agent is currently incompatible with the latest web application version. To ensure a seamless
              experience, please update your Desktop Agent. <br />
              <br />
              {desktopAgentLatestCompatibleVersion ? (
                <a href={downloadLink} target="_blank">
                  Click here to download the latest Desktop Agent version
                </a>
              ) : (
                'We could not find matching Desktop Agent version for your OS. Please contact support.'
              )}
            </Typography>
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
