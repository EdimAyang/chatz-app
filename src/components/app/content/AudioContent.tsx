import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { StatusIcon } from "../MessageBubble";
import {
  AlertCircle,
  AudioLines,
  Check,
  CheckCheck,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import type { MessageStatus } from "#/types";
import { MessageContentWidth } from "./FileContent";

interface AudioContentProps {
  mine: boolean;
  audio: string;
  duration: number;
  time: string;
  isRead: boolean;
  status?: MessageStatus;
  isDeleted: boolean;
  deleteTime: string;
}

export const AudioContent = ({
  mine,
  audio,
  duration,
  time,
  isRead,
  status,
  isDeleted,
  deleteTime,
}: AudioContentProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    <AudioContentWrapper $mine={mine}>
      {!isDeleted && (
        <audio
          ref={audioRef}
          src={audio}
          crossOrigin="anonymous"
          preload="metadata"
          onEnded={() => setPlaying(false)}
        >
          <track
            kind="captions"
            src={`${audio}.vtt`}
            srcLang="en"
            label="English captions"
            default
          />
        </audio>
      )}

      {isDeleted ? (
        <DeletedAudio>
          <DeletedAudioIcon $mine={mine}>
            <AudioLines size={18} />
          </DeletedAudioIcon>

          <DeletedAudioInfo>
            <DeletedAudioTitle $mine={mine}>Audio deleted</DeletedAudioTitle>

            <DeletedAudioTime $mine={mine}>
              Deleted at {deleteTime}
            </DeletedAudioTime>
          </DeletedAudioInfo>
        </DeletedAudio>
      ) : (
        <>
          <PlayBtn type="button" onClick={togglePlay} $mine={mine}>
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
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </Wave>

          <Duration>{duration}s</Duration>

          <MetaRow>
            <Time $mine={mine}>{time}</Time>
          </MetaRow>
        </>
      )}

      {mine && (
        <StatusIcon $mine={mine} $read={isRead}>
          {" "}
          {status === "failed" ? (
            <AlertCircle size={12} />
          ) : status === "sending" ? (
            <Clock size={12} />
          ) : isRead ? (
            <CheckCheck size={12} />
          ) : status === "sent" ? (
            <Check size={12} />
          ) : (
            <Check size={12} />
          )}{" "}
        </StatusIcon>
      )}
    </AudioContentWrapper>
  );
};

const DeletedAudio = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
`;

const DeletedAudioIcon = styled.div<{ $mine: boolean }>`
  width: 36px;
  height: 36px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: ${({ $mine }) =>
    $mine ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.07)"};

  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255, 255, 255, 0.85)" : theme.colors.textSecondary};
`;

const DeletedAudioInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

const DeletedAudioTitle = styled.div<{ $mine: boolean }>`
  font-size: 13px;
  font-weight: 500;
  font-style: italic;

  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255, 255, 255, 0.9)" : theme.colors.textSecondary};
`;

const DeletedAudioTime = styled.div<{ $mine: boolean }>`
  margin-top: 3px;

  font-size: 10px;
  line-height: 1.2;

  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255, 255, 255, 0.65)" : theme.colors.textSecondary};

  opacity: 0.8;
`;

const pulse = keyframes`
  0%,
  100% {
    transform: scaleY(0.4);
  }

  50% {
    transform: scaleY(1);
  }
`;

const AudioContentWrapper = styled.div<{ $mine: boolean }>`
  ${MessageContentWidth}
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  // width: min(65vw, 320px);
  //  width:100%;
  // min-height: 58px;
  padding: 8px 10px 18px;
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
`;
const PlayBtn = styled.button<{ $mine: boolean }>`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: ${({ $mine }) =>
    $mine ? "rgba(255,255,255,0.2)" : "rgba(250,84,156,0.1)"};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.secondary)};
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  &:hover {
    transform: scale(1.05);
    background: ${({ $mine }) =>
      $mine ? "rgba(255,255,255,0.28)" : "rgba(250,84,156,0.16)"};
  }
  &:active {
    transform: scale(0.94);
  }
`;
const Wave = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  height: 26px;
  min-width: 0;
`;
const Bar = styled.span<{
  $h: number;
  $mine: boolean;
  $i: number;
  $playing: boolean;
}>`
  width: 3px;
  min-height: 4px;
  height: ${({ $h }) => $h}px;
  border-radius: 999px;
  background: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.82)" : "#FF4000")};
  transform-origin: center;
  animation: ${({ $playing }) => ($playing ? pulse : "none")} 1.2s ease-in-out
    ${({ $i }) => $i * 0.07}s infinite;
`;
const Duration = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.75;
  align-self: center;
`;
const MetaRow = styled.div`
  position: absolute;
  right: 10px;
  bottom: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const Time = styled.span<{ $mine: boolean }>`
  display: inline-flex;
  font-size: 10px;
  line-height: 1;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.8)" : theme.colors.textSecondary};
  opacity: 0.8;
`;
