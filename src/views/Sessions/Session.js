import React, { useContext, useState, useEffect, useCallback } from "react";
import { Grid, Box } from "@mui/material";
import AppContext from "../../AppContext";
import { mountedStyle, unmountedStyle } from "../../ui/AnimationStyles";
import UserCard from "../../components/UserCard/UserCard";
import SessionWrapper from "./Session.styled";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Mic } from "@mui/icons-material";
import Button from "@mui/material/Button";
import theme from "../../ui/theme";
import InviteOthers from "../../components/UserCard/InviteOthers";
import { errorCodeToSnackbar } from "../../utils";
import { SyncStageSDKErrorCode } from "@opensesamemedia/syncstage";
import SyncStageUserDelegate from "../../UserDelegate";
import SyncStageConnectivityDelegate from "../../ConnectivityDelegate";
import { enqueueSnackbar } from "notistack";
import { PathEnum } from "../../router/PathEnum";
import produce from "immer";

const MEASUREMENTS_INTERVAL_MS = 2000;

const Session = ({ onLeaveSession, inSession }) => {
  const {
    sessionCode,
    sessionData,
    setSessionData,
    syncStage,
    setCurrentStep,
  } = useContext(AppContext);

  const [measurementsInterval, setMeasurementsInterval] = useState(null);

  // Transmitter
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [measurements, setMeasurements] = useState({});

  // Receivers
  const [measurementsMap, setMeasurementsMap] = useState({});
  const [volumeMap, setVolumeMap] = useState({});
  const [connectedMap, setConnectedMap] = useState({});

  if (!sessionData) {
    setCurrentStep(PathEnum.PROFILE_NICKNAME);
  }

  const onSessionOut = useCallback(() => {
    enqueueSnackbar("You have been disconnected from session");
    setCurrentStep(PathEnum.SESSIONS_JOIN);
  }, [setCurrentStep]);

  const onMutedToggle = useCallback(async () => {
    const mutedState = !muted;
    setMuted(mutedState);
    const errorCode = await syncStage.toggleMicrophone(mutedState);
    errorCodeToSnackbar(errorCode);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setMuted(!mutedState);
    }
  }, [syncStage, muted]);

  const onUserJoined = useCallback((connection) => {
    console.log("onUserJoined");
    // Not adding self connection and avoid duplicates
    if (
      sessionData.transmitter.identifier === connection.identifier ||
      sessionData.receivers.some(
        (receiver) => receiver.identifier === connection.identifier
      )
    ) {
      return;
    }
    setSessionData(
      produce((draft) => {
        draft.receivers.push(connection);
      })
    );
  }, []);

  const onUserLeft = useCallback((identifier) => {
    console.log("onUserLeft");

    setSessionData(
      produce((draft) => {
        draft.receivers = draft.receivers.filter(
          (receiver) => receiver.identifier !== identifier
        );
      })
    );
  }, []);

  const onUserMuted = useCallback((identifier) => {
    setSessionData(
      produce((draft) => {
        const receiver = draft.receivers.find(
          (receiver) => receiver.identifier === identifier
        );
        receiver.isMuted = true;
      })
    );
  }, []);

  const onUserUnmuted = useCallback((identifier) => {
    setSessionData(
      produce((draft) => {
        const receiver = draft.receivers.find(
          (receiver) => receiver.identifier === identifier
        );
        receiver.isMuted = false;
      })
    );
  }, []);

  const onTransmitterConnectivityChanged = useCallback((connected) => {
    setConnected(connected);
  }, []);

  const onReceiverConnectivityChanged = useCallback((identifier, connected) => {
    console.log(
      `onReceiverConnectivityChanged ${identifier}: connected ${connected}`
    );
    setConnectedMap(
      produce((draft) => {
        const connectedReceiver = draft[identifier];
        if (!connectedReceiver) {
          draft[identifier] = connected;
        }
        draft[identifier] = connected;
      })
    );
  }, []);

  const updateMeasurements = useCallback(async () => {
    let errorCode;
    let measurements;

    //Tx measurements
    [measurements, errorCode] = await syncStage.getTransmitterMeasurements();
    errorCodeToSnackbar(errorCode);

    setMeasurements({
      delay: measurements.networkDelayMs,
      jitter: measurements.networkJitterMs,
      quality: measurements.quality,
    });

    //Rx measurements
    sessionData.receivers.forEach(async (receiver) => {
      let errorCode;
      let measurements;
      [measurements, errorCode] = await syncStage.getReceiverMeasurements(
        receiver.identifier
      );
      errorCodeToSnackbar(errorCode);

      setMeasurementsMap(
        produce((draft) => {
          draft[receiver.identifier] = {
            delay: measurements.networkDelayMs,
            jitter: measurements.networkJitterMs,
            quality: measurements.quality,
          };
        })
      );
    });
  }, [syncStage, sessionData]);

  useEffect(() => {
    // Set up the interval
    const intervalId = setInterval(async () => {
      await updateMeasurements();
    }, MEASUREMENTS_INTERVAL_MS);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        syncStage.userDelegate = new SyncStageUserDelegate(
          onUserJoined,
          onUserLeft,
          onUserMuted,
          onUserUnmuted,
          onSessionOut
        );
        syncStage.connectivityDelegate = new SyncStageConnectivityDelegate(
          onTransmitterConnectivityChanged,
          onReceiverConnectivityChanged
        );

        // eslint-disable-next-line no-unused-vars
        const [mutedState, errorCode] = await syncStage.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }

        if (sessionData != null) {
          let errorCode;
          // initialize connection and volume info based on the sessionData state
          sessionData.receivers.forEach(async (receiver) => {
            setConnectedMap(
              produce((draft) => {
                const connectedReceiver = draft[receiver.identifier];
                if (!connectedReceiver) {
                  draft[receiver.identifier] = undefined;
                }
              })
            );

            // Volume
            let volumeValue;
            [volumeValue, errorCode] = await syncStage.getReceiverVolume(
              receiver.identifier
            );
            errorCodeToSnackbar(errorCode);

            setVolumeMap(
              produce((draft) => {
                draft[receiver.identifier] = volumeValue;
              })
            );
          });
          await updateMeasurements();
        }
      }
    }
    executeAsync();
  }, [syncStage, sessionData]);

  return (
    <div style={inSession ? mountedStyle : unmountedStyle}>
      <SessionWrapper>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item style={{ height: "70vh" }}>
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={8}>
              {sessionData && sessionData.transmitter ? (
                <Box gridColumn="span 4">
                  <UserCard
                    transmitter
                    {...sessionData.transmitter}
                    connected={connected}
                    {...measurements}
                  />
                </Box>
              ) : (
                <></>
              )}
              {sessionData &&
                sessionData.receivers &&
                sessionData.receivers.map((connection) => (
                  <Box gridColumn="span 4" key={connection.identifier}>
                    <UserCard
                      {...connection}
                      {...measurementsMap[connection.identifier]}
                      connected={connectedMap[connection.identifier]}
                      volume={volumeMap[connection.identifier]}
                      onVolumeChanged={async (volume) => {
                        setVolumeMap({
                          ...volumeMap,
                          [connection.identifier]: volume,
                        });
                      }}
                      onVolumeChangeCommited={async (volume) => {
                        syncStage.changeReceiverVolume(
                          connection.identifier,
                          volume
                        );
                        setVolumeMap({
                          ...volumeMap,
                          [connection.identifier]: volume,
                        });
                      }}
                    />
                  </Box>
                ))}
              <Box gridColumn="span 4">
                <InviteOthers sessionCode={sessionCode} />{" "}
              </Box>
            </Box>
          </Grid>
          <Grid item style={{ height: "10vh" }} />
        </Grid>
        <div id="footer">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            style={{ margin: 0, paddingTop: "4px" }}
            spacing={2}
          >
            <Grid item style={{ paddingRight: "32px" }}>
              <Button
                style={{ color: theme.onSurfaceVariant }}
                onClick={async () => onLeaveSession()}
              >
                <CallEndIcon />
              </Button>
            </Grid>
            <Grid item style={{ paddingRight: "32px" }}>
              <Button
                style={{ color: theme.onSurfaceVariant }}
                onClick={onMutedToggle}
              >
                {muted ? <MicOffIcon /> : <Mic />}
              </Button>
            </Grid>
            {/* 
            TODO
            <Grid item>
              <Button style={{ color: theme.onSurfaceVariant }}>
                <MoreVertIcon />
              </Button>
            </Grid> */}
          </Grid>
        </div>
      </SessionWrapper>
    </div>
  );
};

export default Session;
