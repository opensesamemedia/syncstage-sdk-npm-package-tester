import React, { useContext } from "react";
import MenuWrapper from "./Menu.styled";
import {
  List,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import ListItemButton from "../StyledListItemButton";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import AppContext from "../../AppContext";
import { PathEnum } from "../../router/PathEnum";
import theme from "../../ui/theme";

const Menu = () => {
  const { currentStep, setCurrentStep } = useContext(AppContext);

  const selectedStyle = {
    "&.Mui-selected": {
      backgroundColor: theme.primary,
      color: theme.onPrimary,
      borderRadius: '100px',
    },
  }

  return (
    <MenuWrapper>
      <List>
        <ListItemButton
          selected={currentStep === PathEnum.PROFILE}
          sx={selectedStyle}
          onClick={() => {setCurrentStep(PathEnum.PROFILE)}}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <AccountCircleOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton
          selected={currentStep === PathEnum.SETUP}
          sx={selectedStyle}
          onClick={() => setCurrentStep(PathEnum.SETUP)}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <MenuBookOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Setup" />
        </ListItemButton>
        <ListItemButton
          selected={currentStep === PathEnum.LOCATION}
          sx={selectedStyle}
          onClick={() => setCurrentStep(PathEnum.LOCATION)}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <BookmarksOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Location" />
        </ListItemButton>
      </List>
    </MenuWrapper>
  );
};

export default Menu;
