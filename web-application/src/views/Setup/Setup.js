import React, { useContext } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AppContext from '../../AppContext';
import ButtonContained from '../../components/StyledButtonContained';
import { PathEnum } from '../../router/PathEnum';

const Setup = () => {
  const { desktopAgentProtocolHandler, desktopAgentConnected, initializeSyncStage, downloadLink } = useContext(AppContext);
  const navigate = useNavigate();

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

          <Grid container direction="column" justifyContent="flex-center" alignItems="center">
            <Grid item>
              <a target="_blank" href={desktopAgentProtocolHandler}>
                {' '}
                Pair Desktop Agent{' '}
              </a>
            </Grid>

            {downloadLink ? (
              <>
                <Grid item style={{ marginTop: '14px' }}>
                  <p>or</p>
                </Grid>
                <Grid item>
                  <a target="_blank" href={downloadLink} download>
                    {' '}
                    Install Desktop Agent{' '}
                  </a>
                </Grid>
              </>
            ) : (
              <Grid item>
                <br />
                <br />
                <p>We could not find matching Desktop Agent version for your OS. Please contact support.</p>
              </Grid>
            )}
          </Grid>
        </>
      )}
      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="flex-end">
        <Grid item>
          <ButtonContained
            onClick={async () => {
              console.log('initializeSyncStage in next acition on setup', initializeSyncStage);
              navigate(PathEnum.SESSION_NICKNAME);
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
