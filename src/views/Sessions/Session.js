import React, { useContext, useState, useEffect } from "react";
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
import { SyncStageSDKErrorCode } from "@opensesamemedia/syncstage-sdk-npm-package-development";
import SyncStageUserDelegate from "../../UserDelegate";
import SyncStageConnectivityDelegate from "../../ConnectivityDelegate";
import { enqueueSnackbar } from "notistack";
import { PathEnum } from "../../router/PathEnum";
import produce from "immer";

const Session = ({ onLeaveSession, inSession }) => {
  const {
    sessionCode,
    sessionData,
    setSessionData,
    syncStage,
    setCurrentStep,
  } = useContext(AppContext);

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

  const onMutedToggle = async () => {
    const mutedState = !muted;
    setMuted(mutedState);
    const errorCode = await syncStage.toggleMicrophone(mutedState);
    errorCodeToSnackbar(errorCode);
    if (errorCode !== SyncStageSDKErrorCode.OK) {
      setMuted(!mutedState);
    }
  };

  const onUserJoined = (connection) => {
    console.log("onUserJoined");
    console.log(connection);
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
  };

  const onUserLeft = (identifier) => {
    console.log("onUserLeft");
    console.log(identifier);

    setSessionData(
      produce((draft) => {
        draft.receivers = draft.receivers.filter((receiver) => receiver.identifier !== identifier);
      })
    );
  };

  const onUserMuted = (identifier) => {
    setSessionData(
      produce((draft) => {
        const receiver = draft.receivers.find(
          (receiver) => receiver.identifier === identifier
        );
        receiver.isMuted = true;
      })
    );
  };

  const onUserUnmuted = (identifier) => {
    setSessionData(
      produce((draft) => {
        const receiver = draft.receivers.find(
          (receiver) => receiver.identifier === identifier
        );
        receiver.isMuted = false;
      })
    );
  };

  const onSessionOut = () => {
    enqueueSnackbar("You have been disconnected from session");
    setCurrentStep(PathEnum.SESSIONS_JOIN);
  };

  const onTransmitterConnectivityChanged = (connected) => {
    setConnected(connected);
  };

  const onReceiverConnectivityChanged = (identifier, connected) => {
    setConnectedMap({
      ...connectedMap,
      [identifier]: {
        connected,
      },
    });
  };

  const [userDelegate] = useState(
    new SyncStageUserDelegate(
      onUserJoined,
      onUserLeft,
      onUserMuted,
      onUserUnmuted,
      onSessionOut
    )
  );

  const [connectivityDelegate] = useState(
    new SyncStageConnectivityDelegate(
      onTransmitterConnectivityChanged,
      onReceiverConnectivityChanged
    )
  );

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        syncStage.userDelegate = userDelegate;
        syncStage.connectivityDelegate = connectivityDelegate;

        // eslint-disable-next-line no-unused-vars
        const [mutedState, errorCode] = await syncStage.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }

        if (sessionData != null) {
          let errorCode;
          let measurements;

          //Tx measurements
          [measurements, errorCode] =
            await syncStage.getTransmitterMeasurements();
          errorCodeToSnackbar(errorCode);

          setMeasurements({
            delay: measurements.networkDelayMs,
            jitter: measurements.networkJitterMs,
            quality: measurements.quality,
          });

          sessionData.receivers.forEach(async (receiver) => {
            // Connected
            if (connectedMap[receiver.identifier] == null) {
              setConnectedMap({
                ...connectedMap,
                [receiver.identifier]: {
                  connected: true,
                },
              });
            }
            // Volume
            let volumeValue;
            [volumeValue, errorCode] = await syncStage.getReceiverVolume(
              receiver.identifier
            );
            errorCodeToSnackbar(errorCode);

            setVolumeMap({
              ...volumeMap,
              [receiver.identifier]: volumeValue,
            });

            // Measurements
            let measurements;
            [measurements, errorCode] = await syncStage.getReceiverMeasurements(
              receiver.identifier
            );
            errorCodeToSnackbar(errorCode);

            setMeasurementsMap({
              ...measurementsMap,
              [receiver.identifier]: {
                delay: measurements.networkDelayMs,
                jitter: measurements.networkJitterMs,
                quality: measurements.quality,
              },
            });
          });
        }
      }
    }
    executeAsync();
  }, [sessionData, syncStage, userDelegate, connectivityDelegate]);

  console.log(sessionData);
  console.log(connectedMap);
  console.log(measurementsMap);

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
                      {...connectedMap[connection.identifier]}
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
            <Grid item>
              <Button style={{ color: theme.onSurfaceVariant }}>
                <MoreVertIcon />
              </Button>
            </Grid>
          </Grid>
        </div>
      </SessionWrapper>
    </div>
  );
};

export default Session;
