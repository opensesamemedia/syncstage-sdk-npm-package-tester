import AppContext from "./AppContext";
import { BrowserRouter as Router } from "react-router-dom";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";

import GlobalStyle from "./ui/GlobalStyle";
import theme from "./ui/theme";
import AppWrapper from "./App.styled";
import { PathEnum } from "./router/PathEnum";
import RoutesComponent from "./router/RoutesComponent";
import Menu from "./components/Menu/Menu";
import "./ui/animationStyles.css";

import SyncStage from "@opensesamemedia/syncstage-sdk-npm-package-development";

const App = () => {
  const [syncStage] = useState(
    null
    // new SyncStage(null, null)
  );
  const [appSecretId, setAppSecretId] = useState(
    process.env.REACT_APP_SYNCSTAGE_SECRET_ID
  );
  const [appSecretKey, setAppSecretKey] = useState(
    process.env.REACT_APP_SYNCSTAGE_SECRET_KEY
  );
  const [nickname, setNickname] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [zoneId, setZoneId] = useState("");

  let startPath = PathEnum.PROFILE_NICKNAME;

  if (Object.values(PathEnum).includes(window.location.pathname.substring(1))) {
    startPath = window.location.pathname.substring(1);
  }

  const [currentStep, setCurrentStep] = useState(startPath);

  const sharedState = {
    syncStage,
    appSecretId,
    setAppSecretId,
    appSecretKey,
    setAppSecretKey,
    nickname,
    setNickname,
    sessionCode,
    setSessionCode,
    zoneId,
    setZoneId,
    currentStep,
    setCurrentStep,
  };

  const onProvisionSubmit = () => {
    setCurrentStep(PathEnum.SETUP);
  };

  const onJoinSession = () => {
    setCurrentStep(PathEnum.SESSIONS_SESSION);
  };

  const onCreateSession = () => {
    setCurrentStep(PathEnum.SESSIONS_SESSION);
  };

  const onLeaveSession = () => {
    setCurrentStep(PathEnum.SESSIONS_JOIN);
  };

  const inSession = currentStep === PathEnum.SESSIONS_SESSION;
  const profileConfigured = nickname && appSecretId && appSecretKey

  return (
    <AppContext.Provider value={sharedState}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppWrapper inSession={inSession}>
          <Router>
            <Menu inSession={inSession} profileConfigured={profileConfigured} />
            <div className="gradient" />
            <div className="app-container">
              <RoutesComponent
                onProvisionSubmit={onProvisionSubmit}
                onJoinSession={onJoinSession}
                onLeaveSession={onLeaveSession}
                onCreateSession={onCreateSession}
                inSession={inSession}
              />
            </div>
          </Router>
        </AppWrapper>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
