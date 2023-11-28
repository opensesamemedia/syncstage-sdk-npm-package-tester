import React, { useContext } from 'react';
import { Grid } from '@mui/material';
import AppContext from '../../AppContext';
import ButtonContained from '../../components/StyledButtonContained';
import { PathEnum } from '../../router/PathEnum';

const Setup = () => {
  const { setCurrentStep, desktopAgentProtocolHandler, desktopConnected } = useContext(AppContext);
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
            <p>To have a low latency conversation you need to have the SyncStage Desktop Agent running.</p>
          </Grid>
          <Grid item style={{ height: '80px' }} />
          <Grid container direction="column" justifyContent="flex-center" alignItems="center">
            <Grid item>
              <a target="_blank" href={desktopAgentProtocolHandler}>
                {' '}
                Open Desktop Agent{' '}
              </a>
            </Grid>
            <Grid item style={{ marginTop: '14px' }}>
              <p>or</p>
            </Grid>
            <Grid item>
              <a target="_blank" href="https://public.sync-stage.com/agent/macos/prod/0.2.0/SyncStageAgent_0.2.0.dmg" download>
                {' '}
                Install Desktop Agent{' '}
              </a>
            </Grid>
          </Grid>
        </>
      )}
      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="flex-end">
        <Grid item>
          <ButtonContained onClick={() => setCurrentStep(PathEnum.PROFILE_NICKNAME)} disabled={!desktopConnected}>
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Setup;
