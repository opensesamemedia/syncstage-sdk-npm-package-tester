import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '../../components/StyledSelect';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import theme from '../../ui/theme';
import { errorCodeToSnackbar } from '../../utils';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';

const ManualLocation = () => {
  const navigate = useNavigate();
  const { selectedServer, persistSelectedServer, syncStage, setBackdropOpen } = useContext(AppContext);
  const [instancesList, setInstancesList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setBackdropOpen(true);
      const [data, errorCode] = await syncStage.getServerInstances();
      setBackdropOpen(false);
      if (errorCode === SyncStageSDKErrorCode.OK) {
        setInstancesList(data);
      } else {
        errorCodeToSnackbar(errorCode);
        setInstancesList([]);
      }
    }
    fetchData();
  }, [syncStage]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Location</h2>
      </Grid>
      <Grid item>
        <p>Select the closest location for all the session participants.</p>
      </Grid>
      <Grid item>
        <FormControl fullWidth style={{ maxWidth: '400px' }}>
          {selectedServer == null ? (
            <InputLabel
              id="region-select-label"
              style={{
                color: theme.text,
              }}
              shrink={false}
            >
              Region
            </InputLabel>
          ) : (
            <></>
          )}

          <Select labelId="region-select-label" value={selectedServer} onChange={(e) => persistSelectedServer(e.target.value)}>
            {instancesList.map((server) => (
              <MenuItem value={server} key={server.studioServerId}>
                {server.zoneName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => navigate(PathEnum.LOCATION)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => {
              navigate(PathEnum.SESSIONS_JOIN);
            }}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ManualLocation;
