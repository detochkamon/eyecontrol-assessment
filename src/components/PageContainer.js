import styled, { createGlobalStyle } from "styled-components";
import palette from '../misc/palette';

const GlobalStyles = createGlobalStyle`
  html {
    min-height: 100%;
  }
  body {
    font-family: 'Roboto Slab', serif;
    background: radial-gradient(
      circle at center,
      ${palette.mediumGrey},
      ${palette.darkGrey}
    );
  }
  input, select, textarea {
    font-family: 'Roboto Slab', serif;
  }
`;

const PageContainerRoot = styled.div`
  color: #fff;
  h1 {
    text-transform: uppercase;
    text-align: center;
    text-shadow: 1px 1px 10px #000;
  }
`;

const PageContainer = (props) => (
  <PageContainerRoot>
    <GlobalStyles />
    {props.children}
  </PageContainerRoot>
);
export default PageContainer;
