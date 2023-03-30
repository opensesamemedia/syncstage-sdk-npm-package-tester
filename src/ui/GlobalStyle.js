import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  body {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 400;
    fonst-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;

    background: ${({ theme }) => theme.background};
    height: 100vh;
    width: 100vw;
    color: ${({ theme }) => theme.text};
  }
`;

export default GlobalStyle