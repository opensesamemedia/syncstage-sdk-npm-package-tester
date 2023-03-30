import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Setup from "../views/Setup/Setup";
import JoinSession from "../views/JoinSession/JoinSession";
import CreateSession from "../views/CreateSession/CreateSession";
import Session from "../views/Session/Session";
import Profile from "../views/Profile/Profile";
import { PathEnum } from "./PathEnum";
import AppContext from "../AppContext";

const RoutesComponent = ({
  onProvisionSubmit,
  onJoinSession,
  onCreateSession,
  onLeaveSession,
}) => {
  const { currentStep, setCurrentStep } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${currentStep}`} replace />} />
      <Route
        path={PathEnum.PROFILE}
        element={
          currentStep === PathEnum.PROFILE ? (
            <Profile/>
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route
        path={PathEnum.SETUP}
        element={
          currentStep === PathEnum.SETUP ? (
            <Setup onProvisionSubmit={onProvisionSubmit} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route
        path={PathEnum.LOCATION}
        element={
          currentStep === PathEnum.LOCATION ? (
            <>LOCATION</>
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />
      <Route
        path={PathEnum.JOIN_SESSION}
        element={
          currentStep === PathEnum.JOIN_SESSION ? (
            <JoinSession
              onCreateSession={() => setCurrentStep(PathEnum.CREATE_SESSION)}
              onJoinSession={onJoinSession}
            />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />
      <Route
        path={PathEnum.CREATE_SESSION}
        element={
          currentStep === PathEnum.CREATE_SESSION ? (
            <CreateSession onCreateSession={onCreateSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
        on
      />
      <Route
        path={PathEnum.SESSION}
        element={
          currentStep === PathEnum.SESSION ? (
            <Session onLeaveSession={onLeaveSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />
    </Routes>
  );
};

export default RoutesComponent;
