import { useCallback, useEffect, useRef, useState } from "react";
// import type { Message } from "@/types";

export const useNewMsgTrigger = (messages: any) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	// const [unreadCount, setUnreadCount] = useState(0);

	const handleScroll = useCallback(() => {
		const el = containerRef.current;

		if (!el) return;


		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
		// console.log(atBottom);

		setIsAtBottom(atBottom);

	}, []);

	const scrollToBottom = () => {
		const el = containerRef.current;

		if (!el) {
			bottomRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
			return;
		}

		requestAnimationFrame(() => {
			el.scrollTo({
				top: el.scrollHeight,
				behavior: "smooth",
			});
		});
	};

	useEffect(() => {
		isAtBottom
		messages
		handleScroll();
	}, [isAtBottom, handleScroll, messages]);

	return {
		scrollToBottom,
		// unreadCount,
		isAtBottom,
		handleScroll,
		bottomRef,
		containerRef,
	};
};
