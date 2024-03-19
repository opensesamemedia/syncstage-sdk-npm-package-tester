import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormControlLabel, FormGroup, Grid, Switch } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';

const Location = () => {
  const navigate = useNavigate();

  const { automatedLocationSelection, setAutomatedLocationSelection } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Location</h2>
      </Grid>
      <Grid item>
        <p>By default, SyncStage selects the best Studio Server for your session based on measurements.</p>
      </Grid>
      <Grid item>
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <FormControlLabel
              value="start"
              control={
                <Switch
                  color="primary"
                  checked={automatedLocationSelection}
                  onChange={(event) => setAutomatedLocationSelection(event.target.checked)}
                />
              }
              label="Automated selection"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
      </Grid>

      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => navigate(PathEnum.SESSION_NICKNAME)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => {
              automatedLocationSelection ? navigate(PathEnum.LOCATION_LATENCIES) : navigate(PathEnum.LOCATION_MANUAL);
            }}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Location;
