import React, { useContext } from "react";
import { Grid } from "@mui/material";
import AppContext from "../../AppContext";
import ButtonContained from "../../components/StyledButtonContained";
import Button from "../../components/StyledButton";
import { PathEnum } from "../../router/PathEnum";

const Setup = ({ onProvisionSubmit }) => {
  const { setCurrentStep } =
    useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Setup</h2>
      </Grid>
      <Grid item>
        <p>
          To have a low latency conversation you need to have the SyncStage Desktop Agent running.
        </p>
      </Grid>
      <Grid item style={{height: '80px'}}/>
      <Grid
        container
        direction="column"
        justifyContent="flex-center"
        alignItems="center"
      >
        <Grid item>
          <a href=""> Open Desktop Agent </a>
        </Grid>
        <Grid item style={{marginTop: "14px"}}>
          <p>or</p>
        </Grid>
        <Grid item>
          <a href=""> Install Desktop Agent </a>
        </Grid>
      </Grid>
      <Grid item style={{height: '80px'}}/>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button
            onClick={() => setCurrentStep(PathEnum.PROFILE_SECRET)}
          >
            Previous
          </Button>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => setCurrentStep(PathEnum.SESSIONS_JOIN)}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Setup;
