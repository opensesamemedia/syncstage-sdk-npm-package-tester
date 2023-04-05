import styled from "styled-components";

const Logo = styled.div`
  position: absolute;
  width: 199px;
  height: 60px;
  left: ${(props) => (props.inSession ? "calc(50vw - 6em)" : "612px")};
  transition: left 1s linear;
  top: 70px;
  
  background: url(logo.png);            
`;

const AppWrapper = styled.div`
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
    background: linear-gradient(
      168.94deg,
      rgba(255, 255, 255, 0) 25.52%,
      #000000 100%
    );
  }

  .gradient2 {
    position: absolute;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    z-index: -100;
    background: linear-gradient(
      168.94deg,
      #000000 0%,
      rgba(255, 255, 255, 0) 72.4%
    );
    opacity: 0.48;
  }

  .app-container {
    padding-top: ${(props) => (props.inSession ? "160px" : "30vh")};
    padding-left: ${(props) => (props.inSession ? "50px" : "400px")};
    padding-right: ${(props) => (props.inSession ? "50px" : "100px")};
    width: ${(props) => (props.inSession ? "100%" : "1200px")};
  }
`;

export default AppWrapper;
export {Logo};
