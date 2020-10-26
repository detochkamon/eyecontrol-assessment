import styled from "styled-components";
import palette from "../misc/palette";

const SpinnerRoot = styled.div`
  border-radius: 50%;
  width: 100%;
  height: 100%;

  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 5px solid ${palette.darkGrey};
  border-right: 5px solid ${palette.darkGrey};
  border-bottom: 5px solid ${palette.darkGrey};
  border-left: 5px solid ${palette.brightGreen};
  transform: translateZ(0);
  animation: load8 1.1s infinite linear;
  box-sizing: border-box;

  &:after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
  }
  @keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;
const Spinner = () => (
  <SpinnerRoot />
);
export default Spinner;