import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

  body {
    font-family: 'Josefin Sans', sans-serif !important;
    
    font-style: normal;
    letter-spacing: 0.25px;

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

export default GlobalStyle;
