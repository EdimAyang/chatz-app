import { MessageType, SocketEvent } from "#/lib/constants";
import { useWebSocketStore } from "#/store/websocket.store";
import type { ChatMessage, MessageStatus } from "#/types";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Pencil, Reply, Smile, Trash2, X } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
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

  padding-top: 4px;
  padding-bottom: 8px;
`;

/* =========================================================
   BUBBLE WRAPPER
========================================================= */

const BubbleWrapper = styled(motion.div)<{
  $mine: boolean;
}>`
  position: relative;

  display: flex;
  flex-direction: column;

  align-items: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};

  max-width: 100%;

  /*
    IMPORTANT FOR MOBILE SWIPE

    Allow the browser to handle vertical scrolling,
    while Framer Motion handles the horizontal swipe.
  */
  touch-action: pan-y;
`;

/* =========================================================
   BUBBLE
========================================================= */

const Bubble = styled(motion.div)<{
  $mine: boolean;
}>`
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

  /*
    IMPORTANT:
    Do NOT put touch-action here.
    The parent BubbleWrapper handles the swipe.
  */

  user-select: none;

  overflow: visible;
`;

/* =========================================================
   STATUS ICON
========================================================= */

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

const Reactions = styled.div<{
  $mine: boolean;
}>`
  position: relative;

  z-index: 6;

  display: flex;

  align-items: center;

  gap: 3px;

  /*
    Pull the reactions slightly into the bottom
    of the message bubble.
  */
  margin-top: -7px;

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

/* =========================================================
   REACTION BADGE
========================================================= */

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
      box-shadow:
        0 0 0 1px rgba(250, 84, 156, 0.15);
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
   DESKTOP REACTION PICKER
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

/* =========================================================
   REACTION BUTTON
========================================================= */

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
   DESKTOP ACTION BAR
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
    DESKTOP ONLY

    Show actions when hovering the message row.
  */
  ${Row}:hover & {
    opacity: 1;

    pointer-events: auto;

    transform: translateY(0);
  }

  /*
    IMPORTANT:
    This desktop action bar is NOT used for the
    mobile swipe action bar.
  */

  @media (max-width: 767px) {
    /*
      Completely disable the desktop action bar
      on mobile.

      Mobile actions are handled by MobileActionBar.
    */
    display: none;
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
   SWIPE INDICATOR
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

/* =========================================================
   REPLY PREVIEW
========================================================= */

const ReplyPreview = styled.div<{
  $mine: boolean;
}>`
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

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ReplyPreviewText = styled.div`
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  font-size: 12px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

/* =========================================================
   MOBILE ACTION BAR
   Appears at the very top after a horizontal swipe.
========================================================= */

const MobileActionBar = styled.div<{ $visible: boolean }>`
  position: fixed;

  top: 0;
  left: 0;
  right: 0;

  width: 100%;
  min-height: 70px;

  z-index: 999999;

  display: ${({ $visible }) => ($visible ? "flex" : "none")};

  align-items: center;
  justify-content: center;

  gap: 8px;

  padding: 8px 12px;

  box-sizing: border-box;

  background: ${({ theme }) => theme.colors.background};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);

  touch-action: manipulation;

  @media (min-width: 768px) {
    display: none;
  }
`;

/* =========================================================
   MOBILE ACTION BUTTON
========================================================= */

const MobileActionButton = styled.button`
  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: none;

  border-radius: 50%;

  background: transparent;

  color: ${({ theme }) => theme.colors.textPrimary};

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 17px;
    height: 17px;
  }
`;

/* =========================================================
   MOBILE REACTION ACTION
========================================================= */

const ReactionActionButton = styled(MobileActionButton)`
  font-size: 18px;
`;

/* =========================================================
   MOBILE REACTION PICKER
========================================================= */

const MobileReactionPicker = styled.div`
  position: fixed;

  top: 64px;
  left: 50%;

  z-index: 1000000;

  display: flex;
  align-items: center;

  transform: translateX(-50%);

  gap: 3px;

  padding: 7px 8px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 999px;

  background: ${({ theme }) => theme.colors.background};

  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.18);

  touch-action: manipulation;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileReactionClose = styled.button`
  width: 30px;
  height: 30px;

  margin-left: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 50%;

  background: transparent;

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* =========================================================
   CLOSE MOBILE ACTIONS
========================================================= */

const CloseMobileActions = styled.button`
  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: none;

  border-radius: 50%;

  background: transparent;

  color: ${({ theme }) => theme.colors.textPrimary};

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:active {
    transform: scale(0.9);
  }
`;

/* =========================================================
   MOBILE ACTION DIVIDER
========================================================= */

const MobileActionDivider = styled.div`
  width: 1px;
  height: 24px;

  margin: 0 4px;

  background: ${({ theme }) => theme.colors.border};
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
  onDelete,
}: MessageBubbleProps) {
  const [showDesktopReactionPicker, setShowDesktopReactionPicker] =
    useState(false);

  const [showMobileReactionPicker, setShowMobileReactionPicker] =
    useState(false);

  const [showMobileActions, setShowMobileActions] = useState(false);

  const [isSwiping, setIsSwiping] = useState(false);

  const reactionOptions = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  const { send } = useWebSocketStore();

  const isTextMessage = message.messageType === MessageType.TEXT;

  const groupedReactions = Object.entries(
    (reactions ?? []).reduce<Record<string, number>>((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] ?? 0) + 1;

      return acc;
    }, {}),
  );

  const handleDragStart = () => {
    setIsSwiping(true);
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 18) {
      setIsSwiping(true);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const horizontalDistance = Math.abs(info.offset.x);

    // console.log("SWIPE:", {
    //   isMobile,
    //   offsetX: info.offset.x,
    //   offsetY: info.offset.y,
    //   horizontalDistance,
    // });

    setIsSwiping(false);

    if (isMobile && horizontalDistance >= 20) {
      setShowMobileActions(true);

      setShowDesktopReactionPicker(false);
      setShowMobileReactionPicker(false);
    }
  };

  // ============================================================
  // REACTION
  // ============================================================

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);

    setShowDesktopReactionPicker(false);
    setShowMobileReactionPicker(false);
    setShowMobileActions(false);
  };

  // ============================================================
  // CLOSE MOBILE ACTIONS
  // ============================================================

  const closeActions = () => {
    setShowMobileActions(false);
    setShowMobileReactionPicker(false);
  };

  // console.log(showMobileActions);

  return (
    <>
      {showMobileActions &&
        createPortal(
          <MobileActionBar
            $visible={showMobileActions}
            onClick={(event) => event.stopPropagation()}
          >
            <CloseMobileActions
              type="button"
              aria-label="Close message actions"
              onClick={() => {
                setShowMobileActions(false);
                setShowMobileReactionPicker(false);
              }}
            >
              <X size={19} />
            </CloseMobileActions>

            <MobileActionDivider />

            <ReactionActionButton
              type="button"
              aria-label="React to message"
              onClick={() => {
                setShowMobileReactionPicker((previous) => !previous);
              }}
            >
              😊
            </ReactionActionButton>

            <MobileActionButton
              type="button"
              aria-label="Reply"
              onClick={() => {
                setShowMobileActions(false);
                setShowMobileReactionPicker(false);
                onReply?.();
              }}
            >
              <Reply size={17} />
            </MobileActionButton>

            {mine && isTextMessage && !message.isDeleted && (
              <MobileActionButton
                type="button"
                aria-label="Edit message"
                onClick={() => {
                  setShowMobileActions(false);
                  setShowMobileReactionPicker(false);
                  onEdit?.();
                }}
              >
                <Pencil size={17} />
              </MobileActionButton>
            )}

            {mine && !message.isDeleted && (
              <MobileActionButton
                type="button"
                aria-label="Delete message"
                onClick={() => {
                  setShowMobileActions(false);
                  setShowMobileReactionPicker(false);
                  onDelete?.();
                }}
              >
                <Trash2 size={17} />
              </MobileActionButton>
            )}
          </MobileActionBar>,
          document.body,
        )}

      {showMobileActions &&
        showMobileReactionPicker &&
        createPortal(
          <MobileReactionPicker onClick={(event) => event.stopPropagation()}>
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

            <MobileReactionClose
              type="button"
              aria-label="Close reactions"
              onClick={() => {
                setShowMobileReactionPicker(false);
              }}
            >
              <X size={16} />
            </MobileReactionClose>
          </MobileReactionPicker>,
          document.body,
        )}

      {/* ========================================================
          MESSAGE ROW
      ======================================================== */}

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
          {/* ====================================================
              DESKTOP REACTION PICKER
          ==================================================== */}

          <AnimatePresence>
            {showDesktopReactionPicker && (
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

                <MobileReactionClose
                  type="button"
                  aria-label="Close reactions"
                  onClick={() => {
                    setShowDesktopReactionPicker(false);
                  }}
                >
                  <X size={16} />
                </MobileReactionClose>
              </ReactionPicker>
            )}
          </AnimatePresence>

          {/* ====================================================
              DESKTOP ACTION BAR
          ==================================================== */}

          <ActionButtons
            $mine={mine}
            data-mobile-open={showMobileActions}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            {/* REPLY */}

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

            {/* REACTION */}

            <ReactionTrigger
              type="button"
              aria-label="React to message"
              title="React"
              onClick={(event) => {
                event.stopPropagation();

                setShowDesktopReactionPicker((previous) => !previous);

                setShowMobileReactionPicker(false);
                setShowMobileActions(false);
              }}
            >
              <Smile size={17} />
            </ReactionTrigger>

            {/* ==================================================
                EDIT — TEXT ONLY
            ================================================== */}

            {mine && isTextMessage && !message.isDeleted && onEdit && (
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

            {/* ==================================================
                DELETE
            ================================================== */}

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

          {/* ====================================================
              SWIPE INDICATOR
          ==================================================== */}

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

          {/* ====================================================
              ACTUAL MESSAGE BUBBLE
          ==================================================== */}

          <Bubble
            $mine={mine}
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
            {/* ==================================================
                REPLY PREVIEW
            ================================================== */}

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

            {/* ==================================================
                MESSAGE CONTENT
            ================================================== */}

            {children}
          </Bubble>

          {/* ====================================================
              REACTIONS
          ==================================================== */}

          {groupedReactions.length > 0 && (
            <Reactions $mine={mine}>
              {groupedReactions.map(([emoji, count]) => {
                const userReacted = reactions?.some(
                  (reaction) =>
                    reaction.userId === currentUserId &&
                    reaction.emoji === emoji,
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
    </>
  );
}
