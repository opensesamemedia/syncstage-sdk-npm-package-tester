import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import theme from '../../ui/theme';
import Badge from '@mui/material/Badge';
import UserCardBase from './UserCardBase';

const StyledSlider = styled(Slider)`
  .MuiSlider-thumb {
    color: ${({ theme }) => theme.primary};
  }
  .MuiSlider-rail {
    color: #504349;
  }
  .MuiSlider-track {
    color: ${({ theme }) => theme.primary};
  }
`;

const StyledLinearProgress = styled(LinearProgress)`
  && {
    background-color: #504349 !important;
  }

  .MuiLinearProgress-bar {
    background-color: ${({ theme }) => theme.primary};
  }
`;

const StyledBadge = styled(Badge)(({ connected }) => {
  const color = connected === 'true' ? '#44b700' : '#93000A';
  const animation = connected === 'true' ? 'ripple 1.2s infinite ease-in-out' : 'none';
  return {
    '& .CustomDotBadge-badge': {
      backgroundColor: color,
      color: color,
      boxShadow: `0 0 0 2px f00`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: animation,
        border: `1px solid ${color}`,
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  };
});

const UserCard = ({
  connected,
  displayName,
  userId,
  isMuted,
  transmitter,
  volume,
  onVolumeChanged,
  onVolumeChangeCommited,
  delay,
  jitter,
  quality,
}) => {
  let nickname = displayName ?? userId;
  if (transmitter) {
    nickname = `${nickname} ${'(You)'}`;
  }

  return (
    <UserCardBase>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ height: '100%', width: '100%' }}>
        <Grid item xs={3} style={{ paddingLeft: '6px' }}>
          <Badge
            badgeContent={transmitter ? <></> : isMuted ? <MicOffIcon style={{ color: '#9d9fa1' }} /> : <MicIcon />}
            color="transparent"
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <StyledBadge
              classes={{ badge: 'CustomDotBadge-badge' }}
              overlap="circular"
              variant="dot"
              connected={connected}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar sx={{ bgcolor: theme.surfaceVariant, width: 62, height: 62 }}>{/* {`${nickname.charAt(0)}`} */}</Avatar>
            </StyledBadge>
          </Badge>
        </Grid>
        <Grid item xs={9}>
          <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" style={{ height: '100%', width: '100%' }}>
            <Grid item style={{ width: '100%' }}>
              <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ width: '100%' }}>
                <Grid item>
                  <p
                    style={{
                      fontSize: '24px',
                      paddingRight: '12px',
                      margin: 0,
                    }}
                  >
                    {nickname}
                  </p>
                </Grid>
              </Grid>
              {transmitter ? (
                <Grid item style={{ height: '12px' }} />
              ) : (
                <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ width: '100%' }}>
                  <Grid item style={{ width: '25%' }}>
                    <p style={{ margin: 0, marginBottom: 4 }}>Volume:</p>
                  </Grid>
                  <Grid item style={{ width: '55%' }}>
                    <StyledSlider
                      value={volume || 0}
                      onChange={(_, newValue) => onVolumeChanged(newValue)}
                      onChangeCommitted={async (_, newValue) => await onVolumeChangeCommited(newValue)}
                    />
                  </Grid>
                </Grid>
              )}

              <Grid item>
                <Divider color="white" style={{ width: '100%' }} light />
              </Grid>
              {/* TODO: recognize and display network type */}
              {/* {transmitter ? (
                <Grid item>
                  <p style={{ marginTop: "6px", marginBottom: "6px" }}>
                    Network type:{" "}
                  </p>
                </Grid>
              ) : (
                <></>
              )} */}
              <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={2} style={{ marginTop: '6px' }}>
                {!(delay === 0 || jitter === 0 || delay === -1 || jitter === -1) ? (
                  <>
                    <Grid item style={{ paddingTop: 0, paddingBottom: 0 }}>
                      <p style={{ margin: 0 }}> Ping: {delay ?? '-'} ms</p>
                    </Grid>
                    <Grid item style={{ paddingTop: 0, paddingBottom: 0 }}>
                      <p style={{ margin: 0 }}> Jitter: {jitter ?? '-'} ms</p>
                    </Grid>
                  </>
                ) : (
                  <Grid item style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <p style={{ margin: 0 }}> Collecting measurements</p>
                  </Grid>
                )}
              </Grid>
              <Grid item>
                <p style={{ margin: 0, marginTop: '6px' }}>Network:</p>
              </Grid>
              <Grid item style={{ marginTop: '6px' }}>
                <StyledLinearProgress variant="determinate" value={quality || 0} style={{ width: '80%' }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </UserCardBase>
  );
};

export default UserCard;
