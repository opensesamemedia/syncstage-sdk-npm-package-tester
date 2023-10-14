import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavigationWrapper from './Navigation.styled';
import { useState } from 'react';
import Menu from '../Menu/Menu';
import Logo from './Logo.styled';

function Navigation({ inSession, profileConfigured }) {
  const muiTheme = useTheme();
  const lgScreenMatches = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const [openedDrawer, setOpenedDrawer] = useState(false);

  const handleDrawerOpen = () => setOpenedDrawer(true);
  const handleDrawerClose = () => setOpenedDrawer(false);

  return (
    <>
      <Menu
        inSession={inSession}
        profileConfigured={profileConfigured}
        drawerOpened={openedDrawer && !inSession}
        onCloseDrawer={handleDrawerClose}
        isMobile={!lgScreenMatches}
      />
      <NavigationWrapper inSession={inSession}>
        {!lgScreenMatches && !inSession && (
          <IconButton color="inherit" aria-label="open drawer" edge="start" size="large" onClick={handleDrawerOpen}>
            <MenuIcon fontSize="36px" />
          </IconButton>
        )}
        <Logo inSession={inSession} />
      </NavigationWrapper>
    </>
  );
}

export default Navigation;
