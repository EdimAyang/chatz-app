import { MessageType, SocketEvent } from "#/lib/constants";
import { useWebSocketStore } from "#/store/websocket.store";
import type { ChatMessage, MessageStatus } from "#/types";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Pencil, Reply, Smile, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import styled from "styled-components";

/* =========================================================
   ROW
========================================================= */

const Row = styled.div<{ $mine: boolean }>`
  position: relative;

  display: flex;
  flex-direction: column;

  align-items: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};

  width: fit-content;
  max-width: min(75%, 700px);

  margin-left: ${({ $mine }) => ($mine ? "auto" : "0")};
  margin-right: ${({ $mine }) => ($mine ? "0" : "auto")};

  /*
    Give the row some vertical breathing room so the
    action bar and reaction badges don't collide with
    neighbouring messages.
  */
  padding-top: 4px;
  padding-bottom: 8px;

  /*
    Important:
    The reaction/action positioning is relative to this row.
  */
`;

/* =========================================================
   BUBBLE WRAPPER
========================================================= */

const BubbleWrapper = styled(motion.div)<{ $mine: boolean }>`
  position: relative;

  display: flex;

  /*
    Keep the bubble and its reaction badge visually attached.
  */
  flex-direction: column;

  align-items: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};

  max-width: 100%;

  touch-action: pan-y;
`;

/* =========================================================
   BUBBLE
========================================================= */

const Bubble = styled(motion.div)<{ $mine: boolean }>`
  position: relative;

  max-width: 100%;

  padding: 10px;

  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};

  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};

  border-radius: 18px;

  border-bottom-right-radius: ${({ $mine }) => ($mine ? "4px" : "22px")};

  border-bottom-left-radius: ${({ $mine }) => ($mine ? "22px" : "4px")};

  box-shadow: ${({ theme }) => theme.shadows.sm};

  word-wrap: break-word;
  overflow-wrap: anywhere;

  touch-action: pan-y;
  user-select: none;

  overflow: visible;
`;

export const StatusIcon = styled.span<{
  $mine: boolean;
  $read: boolean;
}>`
  display: inline-flex;

  align-items: center;

  justify-content: center;

  color: ${({ $mine, $read, theme }) =>
    $mine
      ? $read
        ? "rgba(255,255,255,0.95)"
        : "rgba(255,255,255,0.75)"
      : theme.colors.textSecondary};

  opacity: ${({ $read }) => ($read ? 1 : 0.8)};
`;

/* =========================================================
   REACTIONS
   WhatsApp-style badges attached to bottom of bubble
========================================================= */

const Reactions = styled.div<{ $mine: boolean }>`
  position: relative;

  z-index: 6;

  display: flex;

  align-items: center;

  gap: 3px;

  margin-top: -7px;

  /*
    This is what makes the reaction look attached
    to the bottom of the bubble.
  */
  ${({ $mine }) =>
    $mine
      ? `
        margin-right: 8px;
        justify-content: flex-end;
      `
      : `
        margin-left: 8px;
        justify-content: flex-start;
      `};
`;

const ReactionBadge = styled.button<{
  $selected?: boolean;
}>`
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 3px;

  min-width: 28px;

  height: 27px;

  padding: 2px 7px;

  border-radius: 999px;

  background: ${({ theme }) => theme.colors.background};

  border: 1px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.border};

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  font-size: 14px;

  line-height: 1;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  ${({ $selected }) =>
    $selected &&
    `
      box-shadow: 0 0 0 1px rgba(250, 84, 156, 0.15);
    `}

  &:hover {
    transform: scale(1.08);

    box-shadow: 0 3px 9px rgba(0, 0, 0, 0.14);
  }

  &:active {
    transform: scale(0.94);
  }
`;

/* =========================================================
   REACTION PICKER
========================================================= */

const ReactionPicker = styled(motion.div)<{
  $mine: boolean;
}>`
  position: absolute;

  bottom: calc(100% + 8px);

  ${({ $mine }) =>
    $mine
      ? `
        right: 0;
      `
      : `
        left: 0;
      `};

  display: flex;

  align-items: center;

  gap: 3px;

  padding: 5px 7px;

  background: ${({ theme }) => theme.colors.background};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 999px;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  z-index: 50;

  white-space: nowrap;
`;

const ReactionButton = styled.button`
  width: 34px;

  height: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  background: transparent;

  border-radius: 50%;

  padding: 0;

  font-size: 20px;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};

    transform: scale(1.2);
  }

  &:active {
    transform: scale(0.9);
  }
`;

/* =========================================================
   ACTION BAR
========================================================= */

const ActionButtons = styled.div<{
  $mine: boolean;
}>`
  position: absolute;

  top: -42px;

  ${({ $mine }) =>
    $mine
      ? `
        right: 4px;
      `
      : `
        left: 4px;
      `};

  display: flex;

  align-items: center;

  gap: 2px;

  padding: 3px;

  background: ${({ theme }) => theme.colors.background};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 999px;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);

  z-index: 40;

  opacity: 0;

  pointer-events: none;

  transform: translateY(4px);

  transition:
    opacity 0.15s ease,
    transform 0.15s ease;

  /*
    Desktop hover.
  */
  ${Row}:hover & {
    opacity: 1;

    pointer-events: auto;

    transform: translateY(0);
  }

  /*
    Mobile action bar is activated by long press.
  */
  &[data-mobile-open="true"] {
    opacity: 1;

    pointer-events: auto;

    transform: translateY(0);
  }

  @media (max-width: 768px) {
    top: -44px;

    /*
      Don't rely on hover on touch devices.
    */
    ${Row}:hover & {
      opacity: 0;

      pointer-events: none;

      transform: translateY(4px);
    }

    &[data-mobile-open="true"] {
      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }
  }
`;

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = styled.button`
  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border: none;

  border-radius: 50%;

  background: transparent;

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};

    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.92);
  }

  svg {
    width: 17px;
    height: 17px;
  }
`;

/* =========================================================
   REPLY ACTION
========================================================= */

const ReplyAction = styled(ActionButton)`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* =========================================================
   DELETE ACTION
========================================================= */

const DeleteAction = styled(ActionButton)`
  color: #ef4444;

  &:hover {
    background: rgba(239, 68, 68, 0.08);
  }
`;

/* =========================================================
   REACTION TRIGGER
========================================================= */

const ReactionTrigger = styled(ActionButton)`
  font-size: 17px;
`;

/* =========================================================
   MOBILE LONG-PRESS HINT
========================================================= */

const SwipeIndicator = styled(motion.div)<{
  $mine: boolean;
}>`
  position: absolute;

  top: 50%;

  ${({ $mine }) =>
    $mine
      ? `
        left: -42px;
      `
      : `
        right: -42px;
      `};

  transform: translateY(-50%);

  width: 30px;

  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.background};

  color: ${({ theme }) => theme.colors.textSecondary};

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

  pointer-events: none;

  z-index: 10;
`;

const ReplyPreview = styled.div<{ $mine: boolean }>`
  display: flex;

  width: 100%;

  margin-bottom: 7px;

  overflow: hidden;

  border-radius: 8px;

  background: ${({ $mine }) =>
    $mine ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)"};
`;

const ReplyPreviewBar = styled.div`
  width: 3px;

  flex-shrink: 0;

  background: ${({ theme }) => theme.colors.primary};
`;

const ReplyPreviewContent = styled.div`
  min-width: 0;

  padding: 6px 9px;
`;

const ReplyPreviewSender = styled.div`
  margin-bottom: 2px;

  font-size: 11px;

  font-weight: 700;

  color: ${({ theme }) => theme.colors.primary};
`;

const ReplyPreviewText = styled.div`
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  font-size: 12px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

/* =========================================================
   TYPES
========================================================= */

type Reaction = {
  userId: string;
  emoji: string;
};

export type ReplyToMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  message: string | null;
  messageType: string;
  attachmentUrl: string | null;
  attachmentPublicId: string | null;
  mimeType: string | null;
  duration: number | null;
  createdAt: string | Date;
  isDeleted: boolean;
  deletedAt: string | Date | null;

  sender?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type MessageBubbleProps = {
  clientMessageId?: string | null;
  children: React.ReactNode;

  mine: boolean;

  message: ChatMessage;

  currentUserId?: string;

  onEdit?: () => void;

  onDelete?: () => void;

  onReply?: () => void;

  onReact?: (emoji: string) => void;

  onRemoveReaction?: (emoji: string) => void;

  reactions?: Reaction[];

  replyTo?: ReplyToMessage | null;

  isDeleted?: boolean;

  isEdited?: boolean;

  editedTime?: string;

  status?: MessageStatus;
};

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

export function MessageBubble({
  children,
  mine,
  currentUserId,
  onEdit,
  onReply,
  onReact,
  onRemoveReaction,
  reactions,
  replyTo,
  message,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const [showMobileActions, setShowMobileActions] = useState(false);

  const [isSwiping, setIsSwiping] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLongPressedRef = useRef(false);

  const pointerTypeRef = useRef<"touch" | "mouse" | "pen" | null>(null);

  const reactionOptions = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  const { send } = useWebSocketStore();

  const groupedReactions = Object.entries(
    (reactions ?? []).reduce<Record<string, number>>((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] ?? 0) + 1;

      return acc;
    }, {}),
  );

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerTypeRef.current = event.pointerType;

    if (event.pointerType !== "touch") {
      return;
    }

    hasLongPressedRef.current = false;

    clearLongPress();

    longPressTimer.current = setTimeout(() => {
      hasLongPressedRef.current = true;

      setShowMobileActions(true);
      setShowReactionPicker(false);

      longPressTimer.current = null;
    }, 500);
  };

  const handlePointerUp = () => {
    clearLongPress();
  };

  const handlePointerCancel = () => {
    clearLongPress();

    setIsSwiping(false);
    pointerTypeRef.current = null;
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // If the finger actually starts moving horizontally,
    // this is a swipe, not a long press.
    if (
      pointerTypeRef.current === "touch" &&
      Math.abs(info.offset.x) > 10 &&
      !hasLongPressedRef.current
    ) {
      clearLongPress();
    }
  };

  const handleDragStart = () => {
    // DO NOT clearLongPress() here.
    //
    // Framer Motion can start a drag because of a tiny
    // movement before the 500ms long press finishes.

    setIsSwiping(true);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    clearLongPress();

    if (hasLongPressedRef.current) {
      hasLongPressedRef.current = false;
      setIsSwiping(false);
      pointerTypeRef.current = null;

      return;
    }

    if (pointerTypeRef.current === "touch" && Math.abs(info.offset.x) >= 80) {
      onReply?.();
    }

    setIsSwiping(false);
    pointerTypeRef.current = null;
  };

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);

    setShowReactionPicker(false);

    setShowMobileActions(false);
  };

  const closeActions = () => {
    setShowMobileActions(false);
  };

  return (
    <Row $mine={mine}>
      <BubbleWrapper
        $mine={mine}
        drag="x"
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        dragElastic={0.25}
        dragDirectionLock
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {/* REACTION PICKER */}

        <AnimatePresence>
          {showReactionPicker && (
            <ReactionPicker
              $mine={mine}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: 8,
              }}
              transition={{
                duration: 0.15,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
            >
              {reactionOptions.map((emoji) => (
                <ReactionButton
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleReaction(emoji);
                  }}
                >
                  {emoji}
                </ReactionButton>
              ))}
            </ReactionPicker>
          )}
        </AnimatePresence>

        {/* ACTION BAR */}

        <ActionButtons
          $mine={mine}
          data-mobile-open={showMobileActions}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <ReplyAction
            type="button"
            aria-label="Reply to message"
            title="Reply"
            onClick={(event) => {
              event.stopPropagation();

              onReply?.();

              closeActions();
            }}
          >
            <Reply size={17} />
          </ReplyAction>

          <ReactionTrigger
            type="button"
            aria-label="React to message"
            title="React"
            onClick={(event) => {
              event.stopPropagation();

              setShowReactionPicker((prev) => !prev);

              setShowMobileActions(false);
            }}
          >
            <Smile size={17} />
          </ReactionTrigger>

          {mine && !message.isDeleted && onEdit && (
            <ActionButton
              type="button"
              aria-label="Edit message"
              title="Edit"
              onClick={(event) => {
                event.stopPropagation();

                onEdit();

                closeActions();
              }}
            >
              <Pencil size={17} />
            </ActionButton>
          )}

          {mine && !message.isDeleted && (
            <DeleteAction
              type="button"
              aria-label="Delete message"
              title="Delete"
              onClick={(event) => {
                event.stopPropagation();

                if (message.id.startsWith("temp-")) {
                  return;
                }

                send({
                  type: SocketEvent.DELETE_MESSAGE,
                  conversationId: message.conversationId,
                  messageId: message.id,
                });

                closeActions();
              }}
            >
              <Trash2 size={17} />
            </DeleteAction>
          )}
        </ActionButtons>

        {/* SWIPE INDICATOR */}

        <AnimatePresence>
          {isSwiping && (
            <SwipeIndicator
              $mine={mine}
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.7,
              }}
            >
              <Reply size={15} />
            </SwipeIndicator>
          )}
        </AnimatePresence>

        {/* ACTUAL MESSAGE BUBBLE */}

        <Bubble
          $mine={mine}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onContextMenu={(event) => {
            if (pointerTypeRef.current === "touch") {
              event.preventDefault();
            }
          }}
          initial={{
            opacity: 0,
            y: 8,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 26,
          }}
        >
          {/* REPLY PREVIEW */}

          {replyTo && (
            <ReplyPreview $mine={mine}>
              <ReplyPreviewBar />

              <ReplyPreviewContent>
                <ReplyPreviewSender>
                  {replyTo.senderId === currentUserId
                    ? "You"
                    : (replyTo.sender?.username ?? "Message")}
                </ReplyPreviewSender>

                <ReplyPreviewText>
                  {replyTo.isDeleted
                    ? "This message was deleted"
                    : replyTo.messageType === MessageType.IMAGE
                      ? "📷 Photo"
                      : replyTo.messageType === MessageType.VIDEO
                        ? "🎥 Video"
                        : replyTo.messageType === MessageType.AUDIO
                          ? "🎵 Audio"
                          : replyTo.messageType === MessageType.FILE
                            ? "📎 Document"
                            : replyTo.message || "Message"}
                </ReplyPreviewText>
              </ReplyPreviewContent>
            </ReplyPreview>
          )}

          {/* CONTENT COMPONENT */}

          {children}
        </Bubble>

        {/* REACTIONS */}

        {groupedReactions.length > 0 && (
          <Reactions $mine={mine}>
            {groupedReactions.map(([emoji, count]) => {
              const userReacted = reactions?.some(
                (reaction) =>
                  reaction.userId === currentUserId && reaction.emoji === emoji,
              );

              return (
                <ReactionBadge
                  key={emoji}
                  type="button"
                  $selected={userReacted}
                  aria-label={
                    userReacted
                      ? `Remove ${emoji} reaction`
                      : `React with ${emoji}`
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log(userReacted);

                    if (userReacted) {
                      onRemoveReaction?.(emoji);
                    } else {
                      onReact?.(emoji);
                    }
                  }}
                >
                  <span>{emoji}</span>

                  {count > 1 && <span>{count}</span>}
                </ReactionBadge>
              );
            })}
          </Reactions>
        )}
      </BubbleWrapper>
    </Row>
  );
}
