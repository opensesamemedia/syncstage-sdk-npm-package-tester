import React from 'react';
import styled from 'styled-components';

const Paper = styled.div`
  color: ${({ theme }) => theme.text} !important;
  width: 363px;
  height: 164px;
  margin: 6px;
  background: linear-gradient(0deg, rgba(208, 188, 255, 0.11), rgba(208, 188, 255, 0.11)), #1c1b1f !important;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) !important;
  border-radius: 24px !important;
  padding: 12px;
  z-index: 100;
`;

const UserCardBase = ({ children }) => {
  return <Paper>{children}</Paper>;
};

export default UserCardBase;
