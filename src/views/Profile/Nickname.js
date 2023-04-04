import React, { useContext } from "react";
import { Grid } from "@mui/material";
import TextField from "../../components/StyledTextField";
import ButtonContained from "../../components/StyledButtonContained";
import AppContext from "../../AppContext";
import { PathEnum } from "../../router/PathEnum";
import Button from "../../components/StyledButton";

const Nickname = () => {
  const {
    nickname, setNickname, setCurrentStep
  } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Profile</h2>
      </Grid>
      <Grid item>
        <p>
          Please enter your nickname and upload your secret file. You can get your secret file from the SyncStage Developer Console.
        </p>
      </Grid>
      <Grid item>
        <TextField
          label="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{width: '70%'}}
        />
      </Grid>   
      <Grid item style={{height: '140px'}}/>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => setCurrentStep(PathEnum.SETUP)}>
            Previous
          </Button>
        </Grid>
        <Grid item>
          <ButtonContained
            disabled={nickname === ""}
            onClick={() => {
              setCurrentStep(PathEnum.PROFILE_SECRET)
            }}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
      
    </Grid>
  );
};

export default Nickname;
