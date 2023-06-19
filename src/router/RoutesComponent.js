import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Setup from '../views/Setup/Setup';
import JoinSession from '../views/Sessions/JoinSession';
import Session from '../views/Sessions/Session';
import Nickname from '../views/Profile/Nickname';
import Secret from '../views/Profile/Secret';
import Dev from '../views/Development/Dev';
import { PathEnum } from './PathEnum';
import AppContext from '../AppContext';
import Location from '../views/Location/Location';
import Latencies from '../views/Location/Latencies';
import ManualLocation from '../views/Location/ManualLocation';

const RoutesComponent = ({ onProvisionSubmit, onJoinSession, onCreateSession, onLeaveSession, inSession }) => {
  const { currentStep } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${currentStep}`} replace />} />
      <Route
        path={PathEnum.PROFILE_NICKNAME}
        element={currentStep === PathEnum.PROFILE_NICKNAME ? <Nickname /> : <Navigate to={`/${currentStep}`} replace />}
      />

      <Route
        path={PathEnum.PROFILE_SECRET}
        element={
          currentStep === PathEnum.PROFILE_SECRET ? (
            <Secret onProvisionSubmit={onProvisionSubmit} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route path={PathEnum.SETUP} element={currentStep === PathEnum.SETUP ? <Setup /> : <Navigate to={`/${currentStep}`} replace />} />

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
            <Session onLeaveSession={onLeaveSession} inSession={inSession} />
          ) : (
            <Navigate to={`/${currentStep}`} replace />
          )
        }
      />

      <Route path={PathEnum.DEV} element={currentStep === PathEnum.DEV ? <Dev /> : <Navigate to={`/${currentStep}`} replace />} />
    </Routes>
  );
};

export default RoutesComponent;
