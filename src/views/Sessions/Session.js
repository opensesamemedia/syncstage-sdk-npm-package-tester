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
import SyncStageUserDelegate from "../../UserDeletate";
import { enqueueSnackbar } from "notistack";
import { PathEnum } from "../../router/PathEnum";

const Session = ({ onLeaveSession, inSession }) => {
  const {
    sessionCode,
    sessionData,
    setSessionData,
    syncStage,
    setCurrentStep,
  } = useContext(AppContext);
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [connectionsMap, setConnectionsMap] = useState({});

  const [connectionsList, setConnectionsList] = useState([]);

  console.log(sessionData);

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
      sessionData.receivers.some(receiver => receiver.identifier === connection.identifier)
    ) {
      return;
    }
    setSessionData({
      ...sessionData,
      receivers: [...sessionData.receivers, connection],
    });
  };

  const onUserLeft = (identifier) => {
    console.log("onUserLeft");
    console.log(identifier);

    setSessionData({
      ...sessionData,
      receivers: sessionData.receivers.filter((receiver) => {
        return receiver.identifier !== identifier;
      }),
    });
  };

  const onUserMuted = (identifier) => {
    // sessionData.receivers.forEach((receiver) => {
    //   if (receiver.identifier === identifier) {
    //     receiver.isMuted = true;
    //   }
    // });
    // setSessionData(sessionData);
  };

  const onUserUnmuted = (identifier) => {
    // sessionData.receivers.forEach((receiver) => {
    //   if (receiver.identifier === identifier) {
    //     receiver.isMuted = false;
    //   }
    // });
    // setSessionData(sessionData);
  };

  const onSessionOut = () => {
    enqueueSnackbar("You have been disconnected from session");
    setCurrentStep(PathEnum.SESSIONS_JOIN);
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

  console.log(sessionData);

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        syncStage.userDelegate = userDelegate;

        // eslint-disable-next-line no-unused-vars
        const [mutedState, errorCode] = await syncStage.isMicrophoneMuted();
        errorCodeToSnackbar(errorCode);
        if (errorCode === SyncStageSDKErrorCode.OK) {
          setMuted(mutedState);
        }

        if (sessionData) {
          console.log("Updating connections");

          sessionData.receivers.forEach(async (receiver) => {
            const connection = connectionsMap[receiver.identifier];
            if (!connection) {
              const tempConnections = connectionsMap;
              tempConnections[receiver.identifier] = receiver;
              tempConnections[receiver.identifier].connected = false;

              let [volumeValue, errorCode] = await syncStage.getReceiverVolume(
                receiver.identifier
              );
              errorCodeToSnackbar(errorCode);

              tempConnections[receiver.identifier].volume = volumeValue;

              let measurements;
              [measurements, errorCode] =
                await syncStage.getReceiverMeasurements(receiver.identifier);
              errorCodeToSnackbar(errorCode);
              tempConnections[receiver.identifier].delay =
                measurements.networkDelayMs;
              tempConnections[receiver.identifier].jitter =
                measurements.networkJitterMs;
              tempConnections[receiver.identifier].quality =
                measurements.quality;

              setConnectionsMap(tempConnections);
              setConnectionsList(Object.values(tempConnections));
            }
          });
        }
      }
    }
    executeAsync();
  }, [sessionData, syncStage, connectionsMap, userDelegate]);

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
                    // TODO NETWORK MEASUREMENTS
                  />
                </Box>
              ) : (
                <></>
              )}
              {sessionData.receivers &&
                sessionData.receivers.map((connection) => (
                  <Box gridColumn="span 4" key={connection.identifier}>
                    <UserCard
                      {...connection}
                      onVolumeChanged={async (volume) => {
                        // TODO implement debouncing
                        syncStage.changeReceiverVolume(
                          connection.identifier,
                          volume
                        );
                        connectionsMap[connection.identifier].volume = volume;
                        setConnectionsMap(connectionsMap);
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
