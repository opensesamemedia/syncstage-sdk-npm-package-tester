import React, { useContext } from "react";
import { Grid } from "@mui/material";
import ButtonContained from "../../components/StyledButtonContained";
import Button from "../../components/StyledButton";
import TextField from "../../components/StyledTextField";
import AppContext from "../../AppContext";
import { PathEnum } from "../../router/PathEnum";

const JoinSession = ({ onJoinSession }) => {
  const { sessionCode, setSessionCode, setCurrentStep } =
    useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Sessions</h2>
      </Grid>
      <Grid item>
        <p>
          Enter a session code to join an existing session or to create a new
          one.
        </p>
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ paddingLeft: "18px" }}
      >
        <Grid item>
          <TextField
            label="Session code"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            style={{ width: "450px" }}
            placeholder="xyz-xyz-xyz"
          />
        </Grid>
        <Grid item>
          <ButtonContained
            disabled={sessionCode === ""}
            onClick={onJoinSession}
          >
            Join
          </ButtonContained>
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item style={{height: "30px"}}/>
        <Grid item>
          <p>or</p>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => setCurrentStep(PathEnum.SESSIONS_REGIONS)}
          >
            New session
          </ButtonContained>
        </Grid>
      </Grid>
      <Grid item style={{ height: "80px" }} />
      <Grid container justifyContent="flex-start">
        <Grid item>
          <Button
            onClick={() => {
              setCurrentStep(PathEnum.PROFILE_SECRET);
            }}
          >
            Previous
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default JoinSession;
