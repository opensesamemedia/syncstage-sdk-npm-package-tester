import styled from 'styled-components';

const AppWrapper = styled.div`
  height: 100vh;

  .bg {
    position: fixed;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    background: #780097;
    z-index: -100;
  }
  .gradient1 {
    position: fixed;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    z-index: -100;
    background: linear-gradient(168.94deg, rgba(255, 255, 255, 0) 25.52%, #000000 100%);
  }

  .gradient2 {
    position: fixed;
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
    padding-top: ${(props) => (props.inSession ? '120px' : '160px')};
    padding-bottom: 30px;
    padding-left: 50px;
    padding-right: 50px;
    margin: 0px;
  }

  .app-container-limiter {
    max-width: ${(props) => (props.inSession ? '1400px' : '600px')};
    padding-top: ${(props) => (props.inSession ? '0' : '15vh')};
    width: 100%;
  }
`;

export default AppWrapper;
