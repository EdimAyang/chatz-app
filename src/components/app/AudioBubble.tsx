import styled, { keyframes } from "styled-components";
import { Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  padding: 2px 16px;
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
  animation: ${pulse} 1.2s ease-in-out ${({ $i }) => $i * 0.07}s infinite;
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

	const [playing, setPlaying] = useState(false);

	const bars = [10, 18, 14, 24, 12, 20, 16, 22, 12, 18, 24, 16, 10, 14];

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

		audio.addEventListener("play", play);
		audio.addEventListener("pause", pause);
		audio.addEventListener("ended", ended);

		return () => {
			audio.removeEventListener("play", play);
			audio.removeEventListener("pause", pause);
			audio.removeEventListener("ended", ended);
		};
	}, []);

	return (
		<Row $mine={mine}>
			<Bubble $mine={mine}>
				<audio ref={audioRef} src={audio} preload="metadata">
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
