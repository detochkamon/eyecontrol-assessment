import styled from "styled-components";
import PlayButtonSvgIcon from '../icons/play-button';
import StopButtonSvgIcon from '../icons/stop-button';
import palette from "../misc/palette";

const ButtonWrapper = styled.button`
  border-radius: 50%;
  padding: 10px;
  border: 0;
  outline: none;
  line-height: 16px;
  transition: background 0.5s;
  border: solid 1px ${palette.darkGrey};

  &:disabled {
    opacity: 0.3;
  }
  &.stop-button {
    background: ${palette.darkGrey};
    color: ${palette.brightGreen};
  }
  &.play-button {
    background: ${palette.brightGreen};
    color: ${palette.darkGrey};
  }
  svg {
    display: block;
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

const PlaybackControlButton = ({ stopped, ...rest }) => {
  return (
    <ButtonWrapper className={stopped ? 'stop-button' : 'play-button'} {...rest}>
      {stopped ? (
        <PlayButtonSvgIcon />
      ) : (
        <StopButtonSvgIcon />
      )}
    </ButtonWrapper>
  )
};
export default PlaybackControlButton;