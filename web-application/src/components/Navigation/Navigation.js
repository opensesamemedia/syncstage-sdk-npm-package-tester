import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavigationWrapper from './Navigation.styled';
import { useMemo, useState } from 'react';
import Menu from '../Menu/Menu';
import Logo from './Logo.styled';

function Navigation({ inSession, hidden, nicknameSetAndProvisioned }) {
  const muiTheme = useTheme();
  const lgScreenMatches = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const [openedMobileDrawer, setOpenedMobileDrawer] = useState(false);

  const handleDrawerOpen = () => setOpenedMobileDrawer(true);
  const handleDrawerClose = () => setOpenedMobileDrawer(false);

  const isDrawerOpened = useMemo(() => {
    if (hidden) return false;
    if (lgScreenMatches) return true;
    return openedMobileDrawer;
  }, [openedMobileDrawer, lgScreenMatches, hidden]);

  return (
    <>
      {!hidden && (
        <Menu
          nicknameSetAndProvisioned={nicknameSetAndProvisioned}
          drawerOpened={isDrawerOpened}
          onCloseDrawer={handleDrawerClose}
          isMobile={!lgScreenMatches}
        />
      )}
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
