import React, { useContext } from "react";
import { Grid } from "@mui/material";
import TextField from "../../components/StyledTextField";
import AppContext from "../../AppContext";

const Profile = ({onProvisionSubmit}) => {
  const {
    userName, setUserName
  } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Profile</h2>
      </Grid>
      <Grid item>
        <p>
          Please enter your nickname.
        </p>
      </Grid>
      <Grid item>
        <TextField
          label="Nickname"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{width: '70%'}}
        />
      </Grid>   
    </Grid>
  );
};

export default Profile;
