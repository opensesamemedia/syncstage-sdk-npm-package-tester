import React, { useContext, useState, useEffect } from "react";
import { Grid } from "@mui/material";
import AppContext from "../../AppContext";
import ButtonContained from "../../components/StyledButtonContained";
import { PathEnum } from "../../router/PathEnum";

const Setup = ({ onProvisionSubmit }) => {
  const { setCurrentStep, desktopConnected } = useContext(AppContext);
  

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Setup</h2>
      </Grid>
      {desktopConnected ? (
        <Grid item>
          <p>Desktop agent is up and running.</p>
        </Grid>
      ) : (
        <>
          <Grid item>
            <p>
              To have a low latency conversation you need to have the SyncStage
              Desktop Agent running.
            </p>
          </Grid>
          <Grid item style={{ height: "80px" }} />
          <Grid
            container
            direction="column"
            justifyContent="flex-center"
            alignItems="center"
          >
            <Grid item>
              <a href=""> Open Desktop Agent </a>
            </Grid>
            <Grid item style={{ marginTop: "14px" }}>
              <p>or</p>
            </Grid>
            <Grid item>
              <a href=""> Install Desktop Agent </a>
            </Grid>
          </Grid>
        </>
      )}
      <Grid item style={{ height: "80px" }} />
      <Grid container justifyContent="flex-end">
        <Grid item>
          <ButtonContained
            onClick={() => setCurrentStep(PathEnum.PROFILE_NICKNAME)}
            disabled={!desktopConnected}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Setup;
