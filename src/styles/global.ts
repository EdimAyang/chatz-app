import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  body {
    font-family: ${({ theme }) => theme.font};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior-y: none;
    
  }
  button { font-family: inherit; border: none; background: none; cursor: pointer; color: inherit; }
  input, textarea { font-family: inherit; }
  a { color: inherit; text-decoration: none; }
  h1,h2,h3,h4,h5,p { margin: 0; }
  ::-webkit-scrollbar { width: 0; height: 0; }
`;
