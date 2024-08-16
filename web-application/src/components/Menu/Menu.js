import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import MenuWrapper from './Menu.styled';
import { List, ListItemText, ListItemIcon, Drawer } from '@mui/material';
import ListItemButton from '../StyledListItemButton';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import theme from '../../ui/theme';

const Menu = ({ drawerOpened, onCloseDrawer, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { syncStageSDKVersion, signOut } = useContext(AppContext);

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
            <ListItemButton
              selected={location.pathname === `${PathEnum.SETUP}`}
              sx={selectedStyle}
              onClick={() => navigate(PathEnum.SETUP)}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <MenuBookOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Setup" />
            </ListItemButton>

            <ListItemButton
              selected={location.pathname === `${PathEnum.SESSIONS_JOIN}`}
              sx={selectedStyle}
              onClick={() => navigate(PathEnum.SESSIONS_JOIN)}
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

          <span style={{ paddingLeft: 16, paddingTop: 20, fontSize: 10 }}>
            SDK: {syncStageSDKVersion} | Commit: {process.env.REACT_APP_GIT_HASH}{' '}
          </span>
        </MenuWrapper>
      </Drawer>
    </>
  );
};

export default Menu;
