import React, { useContext } from "react";
import { Grid, Button } from "@mui/material";
import AppContext from "../../AppContext";

const Session = ({onLeaveSession}) => {
  const { username } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h1>Session</h1>
      </Grid>
      <Grid item>
        <p>Welcome, {username}!</p>
      </Grid>
      {/* Display the connected musicians and their cards with avatars */}
      <Grid item>
        <Button variant="contained" color="primary" onClick={() => {onLeaveSession()}}>
          Leave session
        </Button>
      </Grid>
    </Grid>
  );
};

export default Session;
