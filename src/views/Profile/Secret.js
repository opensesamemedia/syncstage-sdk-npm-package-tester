import React, { useContext } from "react";
import { Grid } from "@mui/material";
import TextField from "../../components/StyledTextField";
import AppContext from "../../AppContext";
import ButtonContained from "../../components/StyledButtonContained";
import Button from "../../components/StyledButton";
import { PathEnum } from "../../router/PathEnum";

const Secret = ({ onProvisionSubmit }) => {
  const {
    appSecretId,
    setAppSecretId,
    appSecretKey,
    setAppSecretKey,
    setCurrentStep,
  } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Secrets</h2>
      </Grid>
      <Grid item>
        <p>
          Please upload your secret file. You can get your secret file from the
          SyncStage Developer Console.
        </p>
      </Grid>
      <Grid item>
        <TextField
          label="Application Secret ID"
          value={appSecretId}
          onChange={(e) => setAppSecretId(e.target.value)}
          style={{ width: "90%" }}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Application Secret Key"
          value={appSecretKey}
          onChange={(e) => setAppSecretKey(e.target.value)}
          style={{ width: "90%" }}
          type="password"
        />
      </Grid>
      <Grid item style={{ height: "140px" }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button
            onClick={() => setCurrentStep(PathEnum.PROFILE_NICKNAME)}
          >
            Previous
          </Button>
        </Grid>
        <Grid item>
          <ButtonContained
            disabled={appSecretId === "" || appSecretKey === ""}
            onClick={onProvisionSubmit}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Secret;
