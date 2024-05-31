import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Setup from '../views/Setup/Setup';
import JoinSession from '../views/Sessions/JoinSession';
import Session from '../views/Sessions/Session';
import SessionNickname from '../views/SessionNickname/SessionNickname';
import { PathEnum } from './PathEnum';
import LoginView from '../views/Login/LoginView';
import BackdropView from '../views/Backdrop/BackdropView';

const RoutesComponent = ({
  onJoinSession,
  onCreateSession,

  inSession,

  onProvisionSubmit,
}) => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`${PathEnum.LOADING}`} />} />

      <Route path={PathEnum.LOADING} element={<BackdropView />} />

      <Route path={PathEnum.LOGIN} element={<LoginView />} />

      <Route path={PathEnum.SESSION_NICKNAME} element={<SessionNickname />} />

      <Route path={PathEnum.SETUP} element={<Setup onProvisionSubmit={onProvisionSubmit} />} />

      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} onCreateSession={onCreateSession} />} />
      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} />} />

      <Route path={PathEnum.SESSIONS_JOIN} element={<JoinSession onJoinSession={onJoinSession} />} />

      <Route path={PathEnum.SESSIONS_SESSION_CODE} element={<Session inSession={inSession} />} />
    </Routes>
  );
};

export default RoutesComponent;
