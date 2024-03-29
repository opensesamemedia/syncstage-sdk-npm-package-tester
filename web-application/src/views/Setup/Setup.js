import React, { useContext } from 'react';
import { Grid } from '@mui/material';
import AppContext from '../../AppContext';
import ButtonContained from '../../components/StyledButtonContained';

const Setup = ({ onProvisionSubmit }) => {
  const { desktopAgentProtocolHandler, desktopAgentConnected } = useContext(AppContext);

  const getDownloadLink = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Mac') !== -1) {
      return 'https://public.sync-stage.com/agent/macos/prod/0.3.1/SyncStageAgent_0.3.1.dmg';
    } else if (userAgent.indexOf('Win') !== -1) {
      return 'https://public.sync-stage.com/agent/windows/prod/0.1.0/SyncStageAgent_0.1.0.exe';
    } else {
      return null;
    }
  };

  const downloadLink = getDownloadLink();

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Setup</h2>
      </Grid>
      {desktopAgentConnected ? (
        <Grid item>
          <p>Desktop agent is up and running.</p>
        </Grid>
      ) : (
        <>
          <Grid item>
            <p>To have a low latency conversation you need to have the SyncStage Desktop Agent running.</p>
          </Grid>
          <Grid item style={{ height: '80px' }} />
          {downloadLink ? (
            <Grid container direction="column" justifyContent="flex-center" alignItems="center">
              <Grid item>
                <a target="_blank" href={desktopAgentProtocolHandler}>
                  {' '}
                  Pair Desktop Agent{' '}
                </a>
              </Grid>
              <Grid item style={{ marginTop: '14px' }}>
                <p>or</p>
              </Grid>
              <Grid item>
                <a target="_blank" href={downloadLink} download>
                  {' '}
                  Install Desktop Agent{' '}
                </a>
              </Grid>
            </Grid>
          ) : (
            <Grid item>
              <p>Your system is not supported yet.</p>
            </Grid>
          )}
        </>
      )}
      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="flex-end">
        <Grid item>
          <ButtonContained
            onClick={() => {
              onProvisionSubmit();
            }}
            disabled={!desktopAgentConnected}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Setup;
