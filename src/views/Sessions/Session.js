import React, { useContext, useState } from "react";
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

const Session = ({ onLeaveSession, inSession }) => {
  const {sessionCode} = useContext(AppContext);
  const [muted, setMuted] = useState(false);

  const onMutedToggle = () => {
    setMuted(!muted);
  }

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
              <Box gridColumn="span 4">
                <UserCard />
              </Box>
              <Box gridColumn="span 4">
                <UserCard />{" "}
              </Box>
              <Box gridColumn="span 4">
                <UserCard />{" "}
              </Box>
              <Box gridColumn="span 4">
                <UserCard />{" "}
              </Box>
              <Box gridColumn="span 4">
                <UserCard />{" "}
              </Box>

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
              <Button style={{ color: theme.onSurfaceVariant }} onClick={async() => onLeaveSession()}>
                <CallEndIcon />
              </Button>
            </Grid>
            <Grid item style={{ paddingRight: "32px" }}>
              <Button style={{ color: theme.onSurfaceVariant }} onClick={onMutedToggle}>
                {muted ? 
                <MicOffIcon />
                : <Mic/>
              
              }
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
