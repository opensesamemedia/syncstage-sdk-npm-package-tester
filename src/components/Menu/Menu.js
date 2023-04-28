import React, { useContext } from 'react';
import MenuWrapper from './Menu.styled';
import { List, ListItemText, ListItemIcon } from '@mui/material';
import ListItemButton from '../StyledListItemButton';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import theme from '../../ui/theme';
import { mountedStyle, unmountedStyle } from '../../ui/AnimationStyles';

const Menu = ({ inSession, profileConfigured }) => {
  const { currentStep, setCurrentStep, desktopConnected, desktopProvisioned, syncStageSDKVersion } = useContext(AppContext);

  const selectedStyle = {
    '&.Mui-selected': {
      backgroundColor: theme.primary,
      color: theme.onPrimaryDark,
      borderRadius: '100px',
    },
    ':hover': {
      backgroundColor: theme.onPrimary,
      color: 'white',
      borderRadius: '100px',
    },
  };

  return (
    <div style={inSession ? unmountedStyle : mountedStyle}>
      <MenuWrapper>
        <List>
          <ListItemButton selected={currentStep === PathEnum.SETUP} sx={selectedStyle} onClick={() => setCurrentStep(PathEnum.SETUP)}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <MenuBookOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Setup" />
          </ListItemButton>
          <ListItemButton
            selected={[PathEnum.PROFILE_NICKNAME, PathEnum.PROFILE_SECRET].includes(currentStep)}
            sx={selectedStyle}
            onClick={() => {
              setCurrentStep(PathEnum.PROFILE_NICKNAME);
            }}
            disabled={!desktopConnected}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <AccountCircleOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>

          <ListItemButton
            selected={[PathEnum.SESSIONS_JOIN, PathEnum.SESSIONS_REGIONS, PathEnum.SESSIONS_SESSION].includes(currentStep)}
            sx={selectedStyle}
            onClick={() => setCurrentStep(PathEnum.SESSIONS_JOIN)}
            disabled={!profileConfigured || !desktopProvisioned}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText primary="Sessions" />
          </ListItemButton>
        </List>
        <p style={{ paddingLeft: 16, paddingTop: 20, fontSize: 10 }}>SDK: {syncStageSDKVersion}</p>
      </MenuWrapper>
    </div>
  );
};

export default Menu;
