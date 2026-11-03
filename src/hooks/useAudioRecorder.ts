import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const WAVEFORM_BAR_COUNT = 32;
const INITIAL_WAVEFORM = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, index) =>
  0.15 + Math.abs(Math.sin(index * 0.55)) * 0.35,
);

export function useAudioRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const lastWaveformUpdate = useRef(0);
  const audioUrlRef = useRef<string | null>(null);
  const stopPromiseResolver = useRef<((blob: Blob | null) => void) | null>(null);
  const discardOnStop = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState(INITIAL_WAVEFORM);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWaveform = useCallback(() => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    analyser.current = null;
    if (audioContext.current) {
      void audioContext.current.close();
      audioContext.current = null;
    }

    setWaveformLevels(INITIAL_WAVEFORM);
  }, []);

  const startRecording = useCallback(async () => {
    let mediaStream: MediaStream | null = null;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      stream.current = mediaStream;

      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (AudioContextClass) {
        try {
          const context = new AudioContextClass();
          const inputAnalyser = context.createAnalyser();
          inputAnalyser.fftSize = 256;
          inputAnalyser.smoothingTimeConstant = 0.8;
          context.createMediaStreamSource(mediaStream).connect(inputAnalyser);
          audioContext.current = context;
          analyser.current = inputAnalyser;
          await context.resume();

          setWaveformLevels(INITIAL_WAVEFORM);
          lastWaveformUpdate.current = 0;

          const samples = new Uint8Array(inputAnalyser.fftSize);
          const updateWaveform = (timestamp: number) => {
            if (timestamp - lastWaveformUpdate.current >= 50) {
              inputAnalyser.getByteTimeDomainData(samples);
              const rms = Math.sqrt(
                samples.reduce((sum, sample) => {
                  const normalized = (sample - 128) / 128;
                  return sum + normalized * normalized;
                }, 0) / samples.length,
              );
              const level = Math.min(1, Math.max(0.08, rms * 8));

              setWaveformLevels((levels) => [
                ...levels.slice(1),
                level,
              ]);
              lastWaveformUpdate.current = timestamp;
            }

            if (analyser.current === inputAnalyser) {
              animationFrame.current = requestAnimationFrame(updateWaveform);
            }
          };

          animationFrame.current = requestAnimationFrame(updateWaveform);
        } catch (waveformError: unknown) {
          stopWaveform();
          console.error("Could not initialize the recording waveform.", waveformError);
        }
      }

      const recorder = new MediaRecorder(mediaStream);
      setDuration(0);

      timer.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      chunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
          if (recorder.state === "paused") {
            const previewBlob = new Blob(chunks.current, {
              type: recorder.mimeType || "audio/webm",
            });
            const previewUrl = URL.createObjectURL(previewBlob);
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = previewUrl;
            setAudioBlob(previewBlob);
            setAudioUrl(previewUrl);
          }
        }
      };

      recorder.onstop = () => {
        if (discardOnStop.current) {
          discardOnStop.current = false;
          stopPromiseResolver.current?.(null);
          stopPromiseResolver.current = null;
          return;
        }

        const blob = new Blob(chunks.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setAudioUrl(url);

        stopWaveform();
        stream.current?.getTracks().forEach((track) => {
          track.stop();
        });
        stream.current = null;
        setIsPaused(false);
        stopPromiseResolver.current?.(blob);
        stopPromiseResolver.current = null;
      };

      recorder.start(250);

      mediaRecorder.current = recorder;

      setIsRecording(true);
      setIsPaused(false);
    } catch (error: unknown) {
      mediaStream?.getTracks().forEach((track) => track.stop());
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      stopWaveform();
      toast.error(
        error instanceof Error ? error.message : "Could not access microphone.",
      );
    }
  }, [stopWaveform]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorder.current;
    if (!recorder || recorder.state !== "recording") return;

    recorder.pause();
    setIsPaused(true);
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    recorder.requestData();
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorder.current;
    if (!recorder || recorder.state !== "paused") return;

    recorder.resume();
    setIsPaused(false);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
    setAudioBlob(null);
    timer.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    const recorder = mediaRecorder.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(audioBlob);
    }

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    stopWaveform();
    setIsRecording(false);

    return new Promise((resolve) => {
      stopPromiseResolver.current = resolve;
      recorder.stop();
    });
  }, [audioBlob, stopWaveform]);

  const resetAudio = useCallback(() => {
    const recorder = mediaRecorder.current;
    if (recorder && recorder.state !== "inactive") {
      discardOnStop.current = true;
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      stopWaveform();
      recorder.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setIsRecording(false);
      setIsPaused(false);
      stopPromiseResolver.current?.(null);
      stopPromiseResolver.current = null;
    }

    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  }, [stopWaveform]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }

      if (mediaRecorder.current?.state !== "inactive") {
        discardOnStop.current = true;
        mediaRecorder.current?.stop();
      }
      stopPromiseResolver.current?.(null);
      stopPromiseResolver.current = null;
      stream.current?.getTracks().forEach((track) => track.stop());
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        void audioContext.current.close();
      }
      analyser.current = null;
      audioContext.current = null;
      stream.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    waveformLevels,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetAudio,
    duration,
  };
}
