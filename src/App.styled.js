import styled from 'styled-components';

const AppWrapper = styled.div`
  height: 100vh;

  .bg {
    position: absolute;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    background: #780097;
    z-index: -100;
  }
  .gradient1 {
    position: absolute;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    z-index: -100;
    background: linear-gradient(168.94deg, rgba(255, 255, 255, 0) 25.52%, #000000 100%);
  }

  .gradient2 {
    position: absolute;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    z-index: -100;
    background: linear-gradient(168.94deg, #000000 0%, rgba(255, 255, 255, 0) 72.4%);
    opacity: 0.48;
  }

  .app-container {
    display: flex;
    justify-content: center;
    align-items: ${(props) => (props.inSession ? 'flex-start' : 'center')};
    padding-top: ${(props) => (props.inSession ? '160px' : '0px')};
    padding-left: 50px;
    padding-right: 50px;
    margin: 0px;
    height: 100%;
  }

  .app-container-limiter {
    width: ${(props) => (props.inSession ? '100%' : '600px')};
  }
`;

export default AppWrapper;
