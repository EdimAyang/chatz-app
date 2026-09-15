import { useCallback, useRef, useState } from "react";
// import type { Message } from "@/types";

export const useNewMsgTrigger = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;

    if (!el) return;

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90;

    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottomInstant = useCallback(() => {
    const el = containerRef.current;

    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;

    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  return {
    scrollToBottom,
    isAtBottom,
    handleScroll,
    bottomRef,
    containerRef,
    scrollToBottomInstant,
  };
};
