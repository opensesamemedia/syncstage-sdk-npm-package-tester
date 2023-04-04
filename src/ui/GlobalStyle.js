import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  body {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    letter-spacing: 0.25px;

    background: ${({ theme }) => theme.background};
    height: 100vh;
    width: 100vw;
    color: ${({ theme }) => theme.text};
  }
  h2{
    font-size: 28px;
    line-height: 36px;
    font-weight: 700;
  }
  p{
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }

  a{
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
  }

  
`;

export default GlobalStyle