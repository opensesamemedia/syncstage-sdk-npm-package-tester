import React, { useContext } from 'react';
import { FormControlLabel, FormGroup, Grid, Switch } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';

const Location = () => {
  const { setCurrentStep, automatedLocationSelection, setAutomatedLocationSelection } = useContext(AppContext);

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
          <Button onClick={() => setCurrentStep(PathEnum.PROFILE_SECRET)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => {
              automatedLocationSelection ? setCurrentStep(PathEnum.LOCATION_LATENCIES) : setCurrentStep(PathEnum.LOCATION_MANUAL);
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
