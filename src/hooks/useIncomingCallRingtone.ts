import { useEffect, useRef } from "react";
import { useCallStore } from "@/store/call.store";

export function useIncomingCallRingtone() {
  const status = useCallStore((state) => state.status);
  const callerId = useCallStore((state) => state.callerId);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const isIncomingRingingRef = useRef(false);

  const isIncomingRinging =
    status === "ringing" && Boolean(callerId);

  // Keep the latest call state available to browser event handlers.
  useEffect(() => {
    isIncomingRingingRef.current = isIncomingRinging;
  }, [isIncomingRinging]);

  useEffect(() => {
    const audio = new Audio("/sounds/incoming_call.mp3");

    audio.loop = true;
    audio.preload = "auto";

    audioRef.current = audio;

    const stopRingtone = () => {
      audio.pause();
      audio.currentTime = 0;
    };


    // Browsers require a user interaction before allowing audio.
    const unlockAudio = () => {
      if (unlockedRef.current) return;

      if (isIncomingRingingRef.current) {
        audio.muted = false;

        void audio.play()
          .then(() => {
            unlockedRef.current = true;
          })
          .catch((error) => {
            console.warn("Could not unlock ringtone:", error);
          });

        return;
      }

      // Muted playback unlocks audio without making a sound.
      audio.muted = true;

      void audio.play()
        .then(() => {
          stopRingtone();
          audio.muted = false;
          unlockedRef.current = true;
        })
        .catch((error) => {
          console.warn("Audio unlock failed:", error);
        });
    };

    const interactionEvents = [
      "pointerdown",
      "keydown",
      "touchstart",
    ] as const;

    interactionEvents.forEach((event) => {
      window.addEventListener(event, unlockAudio, {
        passive: true,
      });
    });

    return () => {
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, unlockAudio);
      });

      stopRingtone();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!isIncomingRinging) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    if (unlockedRef.current) {
      void audio.play().catch((error) => {
        console.warn("Could not play incoming ringtone:", error);
      });
    }
  }, [isIncomingRinging]);
}
