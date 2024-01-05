import React, { useContext } from 'react';
import MenuWrapper from './Menu.styled';
import { List, ListItemText, ListItemIcon, Drawer } from '@mui/material';
import ListItemButton from '../StyledListItemButton';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LocationOn from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import theme from '../../ui/theme';

const Menu = ({ nicknameSetAndProvisioned, drawerOpened, onCloseDrawer, isMobile }) => {
  const { currentStep, setCurrentStep, syncStageSDKVersion, selectedServer, desktopProvisioned, signOut } = useContext(AppContext);

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
    <>
      <Drawer
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            backgroundColor: !isMobile ? 'transparent' : theme.dark,
            color: 'white',
            border: 'none',
          },
        }}
        variant={!isMobile ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpened}
        onClose={onCloseDrawer}
      >
        <MenuWrapper>
          <List>
            <ListItemButton selected={currentStep === PathEnum.SETUP} sx={selectedStyle} onClick={() => setCurrentStep(PathEnum.SETUP)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <MenuBookOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Setup" />
            </ListItemButton>
            <ListItemButton
              selected={[PathEnum.SESSION_NICKNAME].includes(currentStep)}
              sx={selectedStyle}
              onClick={() => {
                setCurrentStep(PathEnum.SESSION_NICKNAME);
              }}
              disabled={!desktopProvisioned}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AccountCircleOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Session Nickname" />
            </ListItemButton>

            <ListItemButton
              selected={[PathEnum.LOCATION, PathEnum.LOCATION_LATENCIES, PathEnum.LOCATION_MANUAL].includes(currentStep)}
              sx={selectedStyle}
              onClick={() => {
                setCurrentStep(PathEnum.LOCATION);
              }}
              disabled={!nicknameSetAndProvisioned}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LocationOn />
              </ListItemIcon>
              <ListItemText primary="Location" />
            </ListItemButton>

            <ListItemButton
              selected={[PathEnum.SESSIONS_JOIN, PathEnum.SESSIONS_REGIONS, PathEnum.SESSIONS_SESSION].includes(currentStep)}
              sx={selectedStyle}
              onClick={() => setCurrentStep(PathEnum.SESSIONS_JOIN)}
              disabled={!nicknameSetAndProvisioned || !selectedServer}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText primary="Sessions" />
            </ListItemButton>

            <ListItemButton onClick={() => signOut()}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </List>
          <p style={{ paddingLeft: 16, paddingTop: 20, fontSize: 10 }}>SDK: {syncStageSDKVersion}</p>
        </MenuWrapper>
      </Drawer>
    </>
  );
};

export default Menu;
