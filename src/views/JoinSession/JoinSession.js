import React, { useContext } from "react";
import { Button, Grid } from "@mui/material";
import TextField from "../../components/StyledTextField";
import AppContext from "../../AppContext";

const JoinSession = ({onJoinSession, onCreateSession}) => {
  const { sessionCode, setSessionCode } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h1>Join or Create Session</h1>
      </Grid>
      <Grid item>
        <TextField
          label="Enter session code"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
        />
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={()=>onJoinSession()}>
          Join session
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" color="secondary" onClick={()=>onCreateSession()}>
          Create session
        </Button>
      </Grid>
    </Grid>
  );
};

export default JoinSession;
