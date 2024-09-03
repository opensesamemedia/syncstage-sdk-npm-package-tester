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
    background: linear-gradient(185deg, #780097 15%, #191c1d 72%);
  }

  .gradient2 {
    position: fixed;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    z-index: -100;
    background: linear-gradient(188deg, #780097 15%, #191c1d 72%);
  }

  .black-transparent-bg {
    position: fixed;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(0, 0, 0, 0.5);
    z-index: -100;
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

  .dot {
    height: 8px;
    width: 8px;
    margin: 12px;
    border-radius: 50%;
    display: inline-block;
  }
`;

export default AppWrapper;
