import { format, isToday, isYesterday, differenceInMinutes, isSameDay, getHours, isValid } from "date-fns";
import type { Message } from "@/types";

export const formatTime = (value: string | Date) => {
  const date = new Date(value);

  if (!isValid(date)) {
    console.error("Invalid date:", value);
    return "";
  }

  return format(date, "hh:mm a");
};

export const formatRecentDate = (value: string | Date) => {
  const date = new Date(value);

  if (!isValid(date)) {
    console.error("Invalid date:", value);
    return "";
  }

  const isOlderThanWeek = Date.now() - date.getTime() > 7 * 24 * 60 * 60 * 1000;
  return format(date, isOlderThanWeek ? "MMM d, yyyy" : "hh:mm a");
};

export const getGreeting = (date: string | Date) => {
  const hour = getHours(new Date(date));

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
};

export const formatMessageDate = (date: string) => {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) return "Today";

  if (isYesterday(parsedDate)) return "Yesterday";

  return format(parsedDate, "MMM d, yyyy");
};



export const shouldShowTimestamp = (
  currentMessage: Message,
  nextMessage?: Message
) => {
  // Last message in the conversation
  if (!nextMessage) return true;

  // Different sender
  if (currentMessage.senderId !== nextMessage.senderId) {
    return true;
  }

  const currentDate = new Date(currentMessage.createdAt);
  const nextDate = new Date(nextMessage.createdAt);

  // More than 5 minutes apart
  const diff = differenceInMinutes(
    nextDate,
    currentDate
  );

  return diff > 0.1;
};

export const shouldShowDateDivider = (
  currentMessage: Message,
  previousMessage?: Message
) => {
  if (!previousMessage) return true;

  return !isSameDay(
    new Date(currentMessage.createdAt),
    new Date(previousMessage.createdAt)
  );
};

export const shouldShowSenderInfo = (
  currentMessage: Message,
  previousMessage?: Message
) => {
  if (!previousMessage) return true;

  const sameSender =
    currentMessage.senderId ===
    previousMessage.senderId;

  const diff = differenceInMinutes(
    new Date(currentMessage.createdAt),
    new Date(previousMessage.createdAt)
  );

  return !sameSender || diff > 0.1;
};