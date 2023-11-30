import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Setup from '../views/Setup/Setup';
import JoinSession from '../views/Sessions/JoinSession';
import Session from '../views/Sessions/Session';
import SessionNickname from '../views/SessionNickname/SessionNickname';
import { PathEnum } from './PathEnum';
import AppContext from '../AppContext';
import Location from '../views/Location/Location';
import Latencies from '../views/Location/Latencies';
import ManualLocation from '../views/Location/ManualLocation';
import LoginView from '../views/Login/LoginView';

const RoutesComponent = ({
  onJoinSession,
  onCreateSession,
  onLeaveSession,
  inSession,
  onStartRecording,
  onStopRecording,
  onProvisionSubmit,
}) => {
  const { currentStep } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${currentStep}`} replace />} />

      <Route path={PathEnum.LOGIN} element={currentStep === PathEnum.LOGIN ? <LoginView /> : <Navigate to={`/${currentStep}`} replace />} />

      <Route
        path={PathEnum.SESSION_NICKNAME}
        element={currentStep === PathEnum.SESSION_NICKNAME ? <SessionNickname /> : <Navigate to={`/${currentStep}`} replace />}
      />

      <Route
        path={PathEnum.SETUP}
        element={
          currentStep === PathEnum.SETUP ? <Setup onProvisionSubmit={onProvisionSubmit} /> : <Navigate to={`/${currentStep}`} replace />
        }
      />

      <Route
        path={PathEnum.LOCATION}
        element={currentStep === PathEnum.LOCATION ? <Location /> : <Navigate to={`/${currentStep}`} replace />}
      />
      <Route
        path={PathEnum.LOCATION_LATENCIES}
        element={currentStep === PathEnum.LOCATION_LATENCIES ? <Latencies /> : <Navigate to={`/${currentStep}`} replace />}
      />
      <Route
        path={PathEnum.LOCATION_MANUAL}
        element={currentStep === PathEnum.LOCATION_MANUAL ? <ManualLocation /> : <Navigate to={`/${currentStep}`} replace />}
      />
      <Route
        path={PathEnum.SESSIONS_JOIN}
        element={
          currentStep === PathEnum.SESSIONS_JOIN ? (
            <JoinSession onJoinSession={onJoinSession} onCreateSession={onCreateSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />
      <Route
        path={PathEnum.SESSIONS_JOIN}
        element={
          currentStep === PathEnum.SESSIONS_JOIN ? (
            <JoinSession onJoinSession={onJoinSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route
        path={PathEnum.SESSIONS_JOIN}
        element={
          currentStep === PathEnum.SESSIONS_JOIN ? (
            <JoinSession onJoinSession={onJoinSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route
        path={PathEnum.SESSIONS_SESSION}
        element={
          currentStep === PathEnum.SESSIONS_SESSION ? (
            <Session
              onLeaveSession={onLeaveSession}
              inSession={inSession}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
            />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />
    </Routes>
  );
};

export default RoutesComponent;
