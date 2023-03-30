import React, { useContext } from "react";
import { Grid } from "@mui/material";
import TextField from "../../components/StyledTextField";
import AppContext from "../../AppContext";

const Setup = ({onProvisionSubmit}) => {
  const {
    appSecretId,
    setAppSecretId,
    appSecretKey,
    setAppSecretKey,
  } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Secrets</h2>
      </Grid>
      <Grid item>
        <p>
        Please upload your secret file. You can get your secret file from the SyncStage Developer Console.
        </p>
      </Grid>
      <Grid item>
        <TextField
          label="Application Secret ID"
          value={appSecretId}
          onChange={(e) => setAppSecretId(e.target.value)}
          style={{width: '90%'}}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Application Secret Key"
          value={appSecretKey}
          onChange={(e) => setAppSecretKey(e.target.value)}
          style={{width: '90%'}}
        />
      </Grid>   
    </Grid>
  );
};

export default Setup;
