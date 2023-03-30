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
  const [username, setUsername] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [zone, setZone] = useState("");
  const [currentStep, setCurrentStep] = useState(PathEnum.PROFILE);

  const sharedState = {
    syncStage,
    appSecretId,
    setAppSecretId,
    appSecretKey,
    setAppSecretKey,
    username,
    setUsername,
    sessionCode,
    setSessionCode,
    zone,
    setZone,
    currentStep,
    setCurrentStep,
  };

  const onProvisionSubmit = () => {
    setCurrentStep(PathEnum.JOIN_SESSION);
  };

  const onJoinSession = () => {
    setCurrentStep(PathEnum.SESSION);
  };

  const onCreateSession = () => {
    setCurrentStep(PathEnum.SESSION);
  };

  const onLeaveSession = () => {
    setCurrentStep(PathEnum.JOIN_SESSION);
  };

  return (
    <AppContext.Provider value={sharedState}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppWrapper>
          <Router>
            <Menu />
            <div className="gradient" />
            <div className="app-container">
              <RoutesComponent
                onProvisionSubmit={onProvisionSubmit}
                onJoinSession={onJoinSession}
                onLeaveSession={onLeaveSession}
                onCreateSession={onCreateSession}
              />
            </div>
          </Router>
        </AppWrapper>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
