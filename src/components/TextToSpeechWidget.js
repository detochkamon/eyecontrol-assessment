import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import palette from "../misc/palette";
import GoogleCloudTextToSpeechService from "../services/GoogleCloudTextToSpeechService";
import AudioPlayerAndVisualizer from "./AudioPlayerAndVisualizer";
import PlaybackControlButton from "./PlaybackControlButton";
import Spinner from "./Spinner";

const Container = styled.div`
  width: 650px;
  margin: auto;
  background: #474b4f;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.1);
`;

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  margin: auto;
`;

const SpinnerWrapper = styled.div`
  position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
`;

const Control = styled.div`
  margin: 0 10px;
  padding: 5px;
  position: relative;
`;

const Select = styled.select`
  font-size: 16px;
  padding: 10px;
  background: ${palette.darkGrey};
  color: #fff;
  border-radius: 5px;
  border: 0;

  &:disabled {
    opacity: 0.5;
  }
  &.voices {
    width: 190px;
  }
  &.playback-speed {
    width: 130px;
  }
  option {
    padding: 10px;
  }
`;

const ErrorNotificationBar = styled.div`
  background: ${palette.red};
  color: #fff;
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  &.visible {
    transition: visibility 0s, opacity 0.3s, transform 0.3s;
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
  &.hidden {
    transition: visibility 0.3s, opacity 0.3s, transform 0.3s;
    visibility: hidden;
    opacity: 0;
    transform: translateY(100%);
  }
  p {
    padding: 5px 10px;
  }
`;

const TextAreaWrapper = styled.div`
  margin-top: 16px;
  position: relative;
  overflow: hidden;

  textarea {
    width: 100%;
    box-sizing: border-box;
    height: 400px;
    border-radius: 5px;
    padding: 4px 10px;
    font-size: 32px;
    background: ${palette.darkGrey};
    color: #fff;
    resize: none;
    outline: none;
    display: block;
  }
  ${ErrorNotificationBar} {
    position: absolute;
    bottom: 3px;
    left: 3px;
    right: 3px;
    border-radius: 0 0 5px;
  }
`;

const playbackSpeedOptions = [
  {
    id: 'speed1',
    label: 'Speed x0.4',
    speed: 0.4,
  },
  {
    id: 'speed2',
    label: 'Speed x1.0',
    speed: 1,
  },
  {
    id: 'speed3',
    label: 'Speed x1.5',
    speed: 1.5,
  },
  {
    id: 'speed4',
    label: 'Speed x2.0',
    speed: 2,
  },
  {
    id: 'speed5',
    label: 'Speed x2.5',
    speed: 2.5,
  }
];
const playbackSpeedMap = new Map();
for (const speed of playbackSpeedOptions) {
  playbackSpeedMap.set(speed.id, speed);
}

const TextToSpeechWidget = () => {
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voicesList, setVoicesList] = useState([]);
  const [errorMessages, setErrorMessages] = useState({
    other: '',
    textValidation: ''
  });
  const [textToPlay, setTextToPlay] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [selectedPlaybackSpeed, setSelectedPlaybackSpeed] = useState(playbackSpeedMap.get('speed2'));
  const [soundLoadingInProgress, setSoundLoadingInProgress] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [shouldReloadAudio, setShouldReloadAudio] = useState(true);
  const audioElementRef = useRef(null);

  const validEnglishText = /^[a-zA-Z0-9$@$!%*?&#^\-_. +\r\n,()';:]+$/.test(textToPlay) || (textToPlay.trim().length === 0);
  const validText = textToPlay.trim().length > 0 && validEnglishText;
  const errorOccured = Object.values(errorMessages).some(value => value !== '');
  const canPlayOrStop = (voicesList.length > 0 && validText) || playAudio;

  useEffect(async () => {
    setLoadingVoices(true);
    try {
      const response = await GoogleCloudTextToSpeechService.getVoices();
      const { voices } = response.data;
      setVoicesList(voices);

      const [defaultSelectedVoice] = voices;
      setSelectedVoiceName(defaultSelectedVoice.name);
    } catch(error) {
      setErrorMessages(setErrorMessages => ({
        ...setErrorMessages,
        other: 'Oops, something went wrong.'
      }));
    } finally {
      setLoadingVoices(false);
    }
  }, []);

  useEffect(() => {
    if (!validEnglishText) {
      setErrorMessages(setErrorMessages => ({
        ...setErrorMessages,
        textValidation: 'Looks like you typed something that does not belong to English language.'
      }));
    } else {
      setErrorMessages(setErrorMessages => ({
        ...setErrorMessages,
        textValidation: ''
      }));
    }
  }, [validEnglishText]);

  useEffect(() => {
    setShouldReloadAudio(true);
  }, [textToPlay, selectedVoiceName, selectedPlaybackSpeed]);

  async function handlePlaybackControlClick() {
    if (!playAudio) {
      if (shouldReloadAudio) {
        setSoundLoadingInProgress(true);
        try {
          const response = await GoogleCloudTextToSpeechService.textSynthesize(
            textToPlay,
            selectedVoiceName,
            selectedPlaybackSpeed.speed
          );
          const src = `data:audio/ogg;base64,${response.data.audioContent}`;
          setAudioSrc(src);
          setPlayAudio(true);
          setShouldReloadAudio(false);
        } catch(e) {
          setErrorMessages(setErrorMessages => ({
            ...setErrorMessages,
            other: 'Oops, something went wrong.'
          }));
        } finally {
          setSoundLoadingInProgress(false);
        }
      } else {
        setPlayAudio(true);
      }
    } else {
      setPlayAudio(false);
    }
  }

  return (
    <Container>
      <ControlsBar>
        <Control>
          <PlaybackControlButton
            disabled={!canPlayOrStop}
            stopped={!playAudio}
            onClick={handlePlaybackControlClick}
          />
          {soundLoadingInProgress ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : null}
        </Control>
        <Control>
          <Select
            disabled={loadingVoices}
            className="voices"
            onInput={(e) => setSelectedVoiceName(e.target.value)}
            value={selectedVoiceName}
          >
            {loadingVoices ? (
              <option>Loading...</option>
            ) : voicesList.map(({ name }) => (
              <option key={name}>{name}</option>
            ))}
          </Select>
        </Control>
        <Control>
          <Select
            className="playback-speed"
            value={selectedPlaybackSpeed.id}
            onInput={(e) => {
              setSelectedPlaybackSpeed(playbackSpeedMap.get(e.target.value))
              console.log(e.target.value, playbackSpeedMap.get(e.target.value))
            }}
          >
            {playbackSpeedOptions.map(({ id, label }) => (
              <option value={id} key={id}>{label}</option>
            ))}
          </Select>
        </Control>
      </ControlsBar>
      <TextAreaWrapper>
        <textarea
          disabled={soundLoadingInProgress}
          value={textToPlay}
          onInput={(e) => setTextToPlay(e.target.value)}
          placeholder={'Don\'t be shy, type some english sentence'}
        ></textarea>
        <ErrorNotificationBar className={errorOccured ? 'visible' : 'hidden'}>
          {Object.entries(errorMessages).map(([id, errorMessage]) => {
            return errorMessage ? (
              <p key={id}>{errorMessage}</p>
            ): null;
          })}
        </ErrorNotificationBar>
      </TextAreaWrapper>
      <AudioPlayerAndVisualizer
        src={audioSrc}
        play={playAudio}
        onEnded={() => setPlayAudio(false)}
        width={600}
        height={60}
        ref={audioElementRef}
      />
    </Container>
  );
};
export default TextToSpeechWidget;