import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export function useAudioRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      stream.current = mediaStream;

      const recorder = new MediaRecorder(mediaStream);
      setDuration(0);

      timer.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      chunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: "audio/webm",
        });

        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.current?.getTracks().forEach((track) => {
          track.stop();
        });
      };

      recorder.start();

      mediaRecorder.current = recorder;

      setIsRecording(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current) return;

    mediaRecorder.current.stop();

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    setIsRecording(false);
  }, []);

  const resetAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      stream.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetAudio,
    duration
  };
}
