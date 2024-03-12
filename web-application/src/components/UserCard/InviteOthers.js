import React from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import theme from '../../ui/theme';
import UserCardBase from './UserCardBase';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ButtonContained from '../../components/StyledButtonContained';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { enqueueSnackbar } from 'notistack';

const InviteOthers = ({ sessionCode }) => {
  const copySessionUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    enqueueSnackbar('Copied to clipboard');
  };

  return (
    <UserCardBase>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ height: '100%', width: '100%' }}>
        <Grid item sm={3} style={{ paddingLeft: '6px' }}>
          <Avatar sx={{ bgcolor: theme.surfaceVariant, width: 62, height: 62 }}>
            <PersonAddIcon />
          </Avatar>
        </Grid>
        <Grid item sm={9}>
          <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" style={{ height: '100%', width: '100%' }}>
            <Grid item style={{ width: '100%' }}>
              <Grid item>
                <p
                  style={{
                    fontSize: '24px',
                    paddingRight: '12px',
                    margin: 0,
                    paddingBottom: '12px',
                  }}
                >
                  Invite others
                </p>
              </Grid>
              <Grid item>
                <Divider color="white" style={{ width: '100%' }} light />
              </Grid>
            </Grid>

            <Grid item>
              <Divider color="white" style={{ width: '100%' }} light />
            </Grid>

            <Grid item>
              <p style={{ margin: 0, marginTop: '8px' }}>Share this code with others:</p>
            </Grid>
            <Grid item>
              <p style={{ margin: 0, marginTop: '8px', fontWeight: 'bold' }}>{sessionCode}</p>
            </Grid>
            <Grid item style={{ marginTop: '8px' }}>
              <ButtonContained onClick={copySessionUrlToClipboard}>
                <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ height: '100%', width: '100%' }}>
                  <Grid item>
                    <ContentCopyIcon style={{ paddingRight: '8px' }} />
                  </Grid>
                  <Grid item>Copy session URL</Grid>
                </Grid>
              </ButtonContained>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </UserCardBase>
  );
};

export default InviteOthers;
