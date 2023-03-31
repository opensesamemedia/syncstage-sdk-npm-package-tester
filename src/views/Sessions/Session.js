import React, { useContext } from "react";
import { Grid, Box } from "@mui/material";
import AppContext from "../../AppContext";
import ButtonContained from "../../components/StyledButtonContained";
import { mountedStyle, unmountedStyle } from "../../ui/AnimationStyles";
import UserCard from "../../components/UserCard";

const Session = ({ onLeaveSession, inSession }) => {
  const {  } = useContext(AppContext);

  return (
    <div style={inSession ? mountedStyle : unmountedStyle}>
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
          </Box>
        </Grid>
        <Grid item style={{ height: "10vh" }} />
        <Grid item>
          <ButtonContained onClick={onLeaveSession}>
            Leave session
          </ButtonContained>
        </Grid>
      </Grid>
    </div>
  );
};

export default Session;
