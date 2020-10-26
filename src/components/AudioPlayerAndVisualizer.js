import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import palette from "../misc/palette";

const Canvas = styled.canvas`
  border: solid 1px ${palette.mediumGrey};
  border-radius: 3px;
  width: 100%;
`;

const AudioPlayerAndVisualizer = React.forwardRef((props, audioElementRef) => {
  const { src, play, onEnded, width, height } = props;
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const shouldPlayRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    const audio = new Audio();
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      onEnded();
    });
    audio.addEventListener('canplaythrough', () => {
      if (shouldPlayRef.current) {
        audio.currentTime = 0;
        audio.play();
      }
    }, {once: true});
    audioElementRef.current = audio;
    connectVisualizer();

    return () => {
      audioCtxRef.current.close();
    }
  }, []);

  useEffect(() => {
    audioElementRef.current.src = src;
  }, [src]);

  useEffect(() => {
    shouldPlayRef.current = play;
    audioCtxRef.current.resume();
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.pause();
    }
    if (play && audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play();
    }
  }, [play]);

  function connectVisualizer() {
    const audioCtx = audioCtxRef.current;
    analyserRef.current = audioCtx.createAnalyser();

    const audioSource = audioCtx.createMediaElementSource(audioElementRef.current);
    audioSource.connect(analyserRef.current);
    analyserRef.current.connect(audioCtx.destination);
    resumeVisualizer();
  }

  function resumeVisualizer() {
    const ctx = canvasRef.current.getContext('2d');
    animationRef.current = requestAnimationFrame(() => {
      draw(ctx, analyserRef.current, width, height);
    });
  }

  function draw(canvasCtx, analyser, CANVAS_WIDTH, CANVAS_HEIGHT) {
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = palette.brightGreen;
    canvasCtx.setLineDash([]);

    canvasCtx.beginPath();

    const sliceWidth = CANVAS_WIDTH * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * CANVAS_HEIGHT / 2;
      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    canvasCtx.stroke();

    const progressAmount = audioElementRef.current.currentTime / audioElementRef.current.duration;
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = palette.brightGreen;
    canvasCtx.setLineDash([8, 1]);
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, 2);
    canvasCtx.lineTo(progressAmount * CANVAS_WIDTH, 2);
    canvasCtx.stroke();

    animationRef.current = requestAnimationFrame(() => {
      draw(canvasCtx, analyserRef.current, CANVAS_WIDTH, CANVAS_HEIGHT);
    })
  }

  return (
    <Canvas width={width} height={height} ref={canvasRef} />
  );
});
export default AudioPlayerAndVisualizer;