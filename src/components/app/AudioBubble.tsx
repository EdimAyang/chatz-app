import styled, { keyframes } from "styled-components";
import { Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  padding: 2px 5px;
`;
const Bubble = styled(motion.div)<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 22px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 200px;
`;
const PlayBtn = styled.button<{ $mine: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.22)" : "#FFE4EF")};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.secondary)};
`;
const pulse = keyframes`
  0%,100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
`;
const Wave = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  height: 22px;
`;
const Bar = styled.span<{
  $h: number;
  $mine: boolean;
  $i: number;
  $playing: boolean;
}>`
  width: 3px;
  border-radius: 2px;
  height: ${({ $h }) => $h}px;
  background: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.85)" : "#FF4000")};
  transform-origin: center;
  animation: ${({ $playing }) => ($playing ? pulse : "none")} 1.2s ease-in-out
    ${({ $i }) => $i * 0.07}s infinite;
`;
const Duration = styled.span`
  font-size: 12px;
  opacity: 0.85;
`;

const Time = styled.span<{ $mine: boolean }>`
  display: block;
  font-size: 10.5px;
  margin-top: 4px;
  text-align: right;
  opacity: 0.7;
  color: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.9)" : "#7A7A7A")};
`;

type AudioBubbleProps = {
  mine: boolean;
  audio: string;
  duration: number;
  time: string;
};

export function AudioBubble({ mine, audio, duration, time }: AudioBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);

  const defaultBars = [10, 18, 14, 24, 12, 20, 16, 22, 12, 18, 24, 16, 10, 14];
  const [bars, setBars] = useState(defaultBars);

  const startVisualizer = async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = new AudioContextClass();
        const analyser = context.createAnalyser();
        analyser.fftSize = 64;
        const source = context.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(context.destination);
        audioContextRef.current = context;
        analyserRef.current = analyser;
      }

      await audioContextRef.current.resume();
      const analyser = analyserRef.current;
      if (!analyser) return;

      const values = new Uint8Array(analyser.frequencyBinCount);
      const updateBars = () => {
        analyser.getByteFrequencyData(values);
        setBars(
          defaultBars.map((defaultHeight, index) => {
            const value = values[index % values.length] / 255;
            return Math.max(6, Math.round(defaultHeight * (0.45 + value)));
          }),
        );
        if (!audioElement.paused) {
          animationFrameRef.current = requestAnimationFrame(updateBars);
        }
      };
      updateBars();
    } catch {
      // Cross-origin audio may not expose data to the analyser.
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const ended = () => setPlaying(false);
    const stopVisualizer = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setBars(defaultBars);
    };

    audio.addEventListener("play", play);
    audio.addEventListener("play", startVisualizer);
    audio.addEventListener("pause", pause);
    audio.addEventListener("pause", stopVisualizer);
    audio.addEventListener("ended", ended);
    audio.addEventListener("ended", stopVisualizer);

    return () => {
      audio.removeEventListener("play", play);
      audio.removeEventListener("play", startVisualizer);
      audio.removeEventListener("pause", pause);
      audio.removeEventListener("pause", stopVisualizer);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("ended", stopVisualizer);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <Row $mine={mine}>
      <Bubble $mine={mine}>
        <audio
          ref={audioRef}
          src={audio}
          crossOrigin="anonymous"
          preload="metadata"
        >
          <track
            kind="captions"
            src={`${audio}.vtt`}
            srcLang="en"
            label="English captions"
            default
          />
        </audio>

        <PlayBtn onClick={togglePlay} $mine={mine}>
          {playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </PlayBtn>

        <Wave>
          {bars.map((h, i) => (
            <Bar
              key={i}
              $mine={mine}
              $h={h}
              $i={i}
              $playing={playing}
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </Wave>

        <Duration>{duration}s</Duration>
        <Time $mine={mine}>{time}</Time>
      </Bubble>
    </Row>
  );
}
