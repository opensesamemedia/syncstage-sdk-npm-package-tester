import React, { useContext } from "react";
import {
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AppContext from "../../AppContext";

const CreateSession = ({onCreateSession}) => {
  const { zone, setZone } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h1>Choose Zone</h1>
      </Grid>
      <Grid item>
        <FormControl fullWidth>
          <InputLabel>Select a zone</InputLabel>
          <Select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            label="Select a zone"
          >
            <MenuItem value="zone1">Zone 1</MenuItem>
            <MenuItem value="zone2">Zone 2</MenuItem>
            <MenuItem value="zone3">Zone 3</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={() => {onCreateSession()}}>
          Create session in zone
        </Button>
      </Grid>
    </Grid>
  );
};

export default CreateSession;
