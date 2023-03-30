import styled from 'styled-components';

const AppWrapper = styled.div`
  .gradient {
    position: absolute;
    height: 100vh;
    width: 100vw;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;

    opacity: 0.5;
    background: linear-gradient(168.94deg, #FFAED9 0%, rgba(255, 255, 255, 0) 72.4%);
    transform: matrix(1, 0, 0, -1, 0, 0);
  }

  .app-container {
    padding-top: 30vh;
    padding-left: 400px;
    width: 100%;
  }
`;

export default AppWrapper;