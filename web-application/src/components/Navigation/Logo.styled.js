import styled from 'styled-components';

const Logo = styled.div`
  position: absolute;
  width: 199px;
  height: 60px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
`;

export default Logo;
