import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Setup from '../views/Setup/Setup';
import JoinSession from '../views/Sessions/JoinSession';
import Session from '../views/Sessions/Session';
import SessionNickname from '../views/SessionNickname/SessionNickname';
import { PathEnum } from './PathEnum';
import Location from '../views/Location/Location';
import Latencies from '../views/Location/Latencies';
import ManualLocation from '../views/Location/ManualLocation';
import LoginView from '../views/Login/LoginView';
import BackdropView from '../views/Backdrop/BackdropView';

const RoutesComponent = ({
  onJoinSession,
  onCreateSession,
  onLeaveSession,
  inSession,
  onStartRecording,
  onStopRecording,
  onProvisionSubmit,
}) => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`${PathEnum.LOADING}`} />} />

      <Route path={PathEnum.LOADING} element={<BackdropView />} />

      <Route path={PathEnum.LOGIN} element={<LoginView />} />

      <Route path={PathEnum.SESSION_NICKNAME} element={<SessionNickname />} />

      <Route path={PathEnum.SETUP} element={<Setup onProvisionSubmit={onProvisionSubmit} />} />

      <Route path={PathEnum.LOCATION} element={<Location />} />
      <Route path={PathEnum.LOCATION_LATENCIES} element={<Latencies />} />
      <Route path={PathEnum.LOCATION_MANUAL} element={<ManualLocation />} />
      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} onCreateSession={onCreateSession} />} />
      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} />} />

      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} />} />

      <Route
        path={PathEnum.SESSIONS_SESSION_CODE}
        element={
          <Session
            onLeaveSession={onLeaveSession}
            inSession={inSession}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
          />
        }
      />
    </Routes>
  );
};

export default RoutesComponent;
