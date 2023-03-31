import React, { useContext } from "react";
import AppContext from "../AppContext";
import styled from "styled-components";
import Grid from "@mui/material/Grid";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import theme from '../ui/theme';

const Paper = styled.div`
  color: ${({ theme }) => theme.text} !important;
  width: 363px;
  height: 164px;
  margin: 6px;
  background: linear-gradient(0deg, rgba(208, 188, 255, 0.11), rgba(208, 188, 255, 0.11)), #1C1B1F !important;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) !important;
  border-radius: 24px !important;
  padding: 12px;
  z-index: 100;
`;

const StyledSlider = styled(Slider)`
  .MuiSlider-thumb{
    color: ${({ theme }) => theme.primary};
  }
  .MuiSlider-rail{
    color: #504349;
  }
  .MuiSlider-track{
    color: ${({ theme }) => theme.primary};
  }
`;

const StyledLinearProgress = styled(LinearProgress)`
    && {  
        background-color: #504349 !important;  
    }

  .MuiLinearProgress-bar{
    background-color: ${({ theme }) => theme.primary};
  }
  
  
  
`;


const UserCard = ({}) => {
  const {} = useContext(AppContext);

  return (
    <Paper>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        style={{height: "100%", width: "100%"}}
      >
        <Grid item sm={3} style={{paddingLeft: "6px"}} >
            <Avatar sx={{ bgcolor: theme.surfaceVariant, width: 62, height: 62  }}>U</Avatar>
        </Grid>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          sm={9}
          style={{height: "100%", width: "100%"}}
        >
          <Grid item style={{width: "100%"}}>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              style={{width: "100%"}}
            >
              <Grid item >
                <p style={{ fontSize: "24px", paddingRight: "12px", margin: 0}}>Username</p>
              </Grid>
              <Grid item>
                <MicIcon/>
              </Grid>
            </Grid>
            <Grid item>
                <StyledSlider defaultValue={50} style={{width: "70%"}}/>
            </Grid>
            <Grid item>
                <Divider
                    color="white"
                    style={{width: "100%"}}
                    light
                />
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
              style={{marginTop: "6px"}}
            >
                <Grid item style={{paddingTop: 0, paddingBottom: 0}}>
                    <p style={{margin: 0}}> Ping: {} ms</p>
                </Grid>
                <Grid item style={{paddingTop: 0, paddingBottom: 0}}>
                    <p style={{margin: 0}}> Jitter: {} ms</p>
                </Grid>
            </Grid>
            <Grid item>
                <p style={{margin: 0, marginTop: "6px"}}>
                    Network:
                </p>
            </Grid>
            <Grid item style={{marginTop: "6px"}}>
                <StyledLinearProgress variant="determinate" value={90} style={{width: "80%"}}/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserCard;
