import React, { useContext } from 'react';
import { Grid } from '@mui/material';
import TextField from '../../components/StyledTextField';
import AppContext from '../../AppContext';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import { PathEnum } from '../../router/PathEnum';

const Secret = ({ onProvisionSubmit }) => {
  const { jwt, setJwt, setCurrentStep } = useContext(AppContext);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Desktop Agent provisioning</h2>
      </Grid>
      <Grid item>
        <p>
          Please provide the jwt from the response of the authorization method.
          <br></br>
          HINT: In your implementation your application should request this value from your backend service.
        </p>
      </Grid>
      <Grid item>
        <TextField label="jwt" value={jwt} onChange={(e) => setJwt(e.target.value)} style={{ width: '90%' }} />
      </Grid>

      <Grid item style={{ height: '140px' }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => setCurrentStep(PathEnum.PROFILE_NICKNAME)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            disabled={jwt === ''}
            onClick={async () => {
              await onProvisionSubmit();
            }}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Secret;
