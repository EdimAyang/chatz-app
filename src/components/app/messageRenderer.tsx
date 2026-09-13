import { MessageType, SocketEvent } from "#/lib/constants";
import { MessageBubble } from "./MessageBubble";
import { formatTime } from "#/utils/dates";
import { useWebSocketStore } from "#/store/websocket.store";
import { useAuthStore } from "#/store/auth.store";
import type { ChatMessage, MessageStatus } from "#/types";
import { FileContent } from "./content/FileContent";
import { AudioContent } from "./content/AudioContent";
import { VideoContent } from "./content/VideoContents";
import { ImageContent } from "./content/ImageContent";
import { TextContent } from "./content/TextContent";
import { useState } from "react";

export interface MessageRendererProps {
  message: ChatMessage;
  mine: boolean;
  onEdit: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  status: MessageStatus;
}

export const MessageRenderer = ({
  message,
  mine,
  onEdit,
  onReply,
  status,
}: MessageRendererProps) => {
  const { send } = useWebSocketStore();
  const { user } = useAuthStore();
  const [viewingImage, setViewingImage] = useState(false);
  const [viewingVideo, setViewingVideo] = useState(false);

  const sharedProps = {
    mine,
    currentUserId: user?.id,

    status: message.status,

    message: message,

    onReply: () => onReply(message),

    onEdit:
      mine && message.messageType === MessageType.TEXT && !message.isDeleted
        ? () => onEdit(message)
        : undefined,

    replyTo: message.replyTo,

    isDeleted: message.isDeleted,

    isEdited: !message.isDeleted && Boolean(message.editedAt),

    editedTime:
      !message.isDeleted && message.editedAt
        ? formatTime(message.editedAt)
        : undefined,

    reactions: message.reactions,

    onReact: (emoji: string) => {
      send({
        type: SocketEvent.MESSAGE_REACTION,
        conversationId: message.conversationId,
        messageId: message.id,
        emoji,
        action: "add",
      });
    },

    onRemoveReaction: (emoji: string) => {
      send({
        type: SocketEvent.MESSAGE_REACTION,
        conversationId: message.conversationId,
        messageId: message.id,
        emoji,
        action: "remove",
      });
    },
  };

  switch (message.messageType) {
    case MessageType.TEXT:
      return (
        <MessageBubble
          {...sharedProps}
          message={message}
          mine={mine}
          currentUserId={user?.id}
          onEdit={() => {
            if (message.id.startsWith("temp-")) return;

            onEdit?.(message);
          }}
          onReply={() => {
            if (message.id.startsWith("temp-")) return;

            onReply?.(message);
          }}
        >
          <TextContent
            status={status}
            message={
              message.isDeleted
                ? "This message was deleted"
                : (message.message ?? "")
            }
            mine={mine}
            time={formatTime(message.createdAt)}
            isRead={message.isRead}
            isDeleted={message.isDeleted}
            deletedTime={
              message.deletedAt ? formatTime(message.deletedAt) : undefined
            }
            isEdited={!message.isDeleted && Boolean(message.editedAt)}
            editedTime={
              !message.isDeleted && message.editedAt
                ? formatTime(message.editedAt)
                : undefined
            }
          />
        </MessageBubble>
      );

    case MessageType.IMAGE:
      return (
        <MessageBubble
          {...sharedProps}
          message={message}
          mine={mine}
          currentUserId={user?.id}
          onEdit={() => {
            if (message.id.startsWith("temp-")) return;

            onEdit?.(message);
          }}
          onReply={() => {
            if (message.id.startsWith("temp-")) return;

            onReply?.(message);
          }}
        >
          <ImageContent
            onClick={() => setViewingImage(true)}
            setViewingImage={setViewingImage}
            viewingImage={viewingImage}
            deleteTime={formatTime(message.deletedAt!)}
            isDeleted={message.isDeleted}
            src={message.attachmentUrl ?? ""}
            mine={mine}
            time={formatTime(message.createdAt)}
            isRead={message.isRead}
          />
        </MessageBubble>
      );

    case MessageType.VIDEO:
      return (
        <MessageBubble
          {...sharedProps}
          message={message}
          mine={mine}
          currentUserId={user?.id}
          onEdit={() => {
            if (message.id.startsWith("temp-")) return;

            onEdit?.(message);
          }}
          onReply={() => {
            if (message.id.startsWith("temp-")) return;

            onReply?.(message);
          }}
        >
          <VideoContent
            viewingVideo={viewingVideo}
            setViewingVideo={setViewingVideo}
            onViewVideo={() => setViewingVideo(true)}
            deleteTime={formatTime(message.deletedAt!)}
            isDeleted={message.isDeleted}
            status={status!}
            src={message.attachmentUrl ?? ""}
            mine={mine}
            time={formatTime(message.createdAt)}
            isRead={message.isRead}
          />
        </MessageBubble>
      );

    case MessageType.AUDIO:
      return (
        <MessageBubble
          {...sharedProps}
          message={message}
          mine={mine}
          currentUserId={user?.id}
          onEdit={() => {
            if (message.id.startsWith("temp-")) return;

            onEdit?.(message);
          }}
          onReply={() => {
            if (message.id.startsWith("temp-")) return;

            onReply?.(message);
          }}
        >
          <AudioContent
            deleteTime={formatTime(message.deletedAt!)}
            isDeleted={message.isDeleted}
            mine={mine}
            audio={message.attachmentUrl ?? ""}
            duration={message.duration ?? 0}
            time={formatTime(message.createdAt)}
            isRead={message.isRead}
          />
        </MessageBubble>
      );

    case MessageType.FILE:
      return (
        <MessageBubble
          {...sharedProps}
          message={message}
          mine={mine}
          currentUserId={user?.id}
          onEdit={() => {
            if (message.id.startsWith("temp-")) return;

            onEdit?.(message);
          }}
          onReply={() => {
            if (message.id.startsWith("temp-")) return;

            onReply?.(message);
          }}
        >
          <FileContent
            deleteTime={formatTime(message.deletedAt!)}
            isDeleted={message.isDeleted}
            message={message}
            mine={mine}
            time={formatTime(message.createdAt)}
            isRead={message.isRead}
          />
        </MessageBubble>
      );

    default:
      return null;
  }
};

// const Row = styled.div<{ $mine: boolean }>`
//   display: flex;
//   justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
//   padding: 2px 5px;
// `;

// const ImageBubble = styled(motion.div)<{ $mine: boolean }>`
//   max-width: min(78%, 280px);
//   overflow: hidden;
//   border-radius: 22px;
//   border-bottom-right-radius: ${({ $mine }) => ($mine ? "8px" : "22px")};
//   border-bottom-left-radius: ${({ $mine }) => ($mine ? "22px" : "8px")};
//   background: ${({ $mine, theme }) =>
//     $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
//   box-shadow: ${({ theme }) => theme.shadows.sm};
// `;

// const PreviewImage = styled.img`
//   display: block;
//   width: 100%;
//   max-height: 260px;
//   object-fit: cover;
// `;

// const VideoBubble = styled(motion.div)<{ $mine: boolean }>`
//   max-width: min(78%, 320px);
//   border-radius: 22px;
//   border-bottom-right-radius: ${({ $mine }) => ($mine ? "8px" : "22px")};
//   border-bottom-left-radius: ${({ $mine }) => ($mine ? "22px" : "8px")};
//   overflow: hidden;
//   background: ${({ $mine, theme }) =>
//     $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
//   box-shadow: ${({ theme }) => theme.shadows.sm};
// `;

// const VideoPreview = styled.video`
//   display: block;
//   width: 100%;
//   max-height: 260px;
//   background: #000;
// `;

// const FileBubble = styled.a<{ $mine: boolean }>`
//   display: flex;
//   align-items: center;
//   gap: 10px;
//   width: min(78%, 300px);
//   padding: 12px 14px;
//   border-radius: 22px;
//   border-bottom-right-radius: ${({ $mine }) => ($mine ? "8px" : "22px")};
//   border-bottom-left-radius: ${({ $mine }) => ($mine ? "22px" : "8px")};
//   background: ${({ $mine, theme }) =>
//     $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
//   color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
//   box-shadow: ${({ theme }) => theme.shadows.sm};
//   text-decoration: none;
//   flex-wrap: wrap;
// `;

// const FileIconWrap = styled.div<{ $mine: boolean }>`
//   width: 36px;
//   height: 36px;
//   border-radius: 12px;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   background: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.18)" : "#FFE4EF")};
//   color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.secondary)};
// `;

// const FileInfo = styled.div`
//   flex: 1;
//   min-width: 0;
// `;

// const FileName = styled.div`
//   font-size: 13px;
//   font-weight: 600;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;

// const FileMeta = styled.div`
//   font-size: 11px;
//   opacity: 0.72;
//   margin-top: 2px;
// `;

// const MetaRow = styled.div<{ $mine: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   gap: 4px;
//   width: 100%;
//   padding: 10px 10px 8px;
//   color: ${({ $mine, theme }) =>
//     $mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary};
// `;

// const Time = styled.span<{ $mine: boolean }>`
//   display: inline-block;
//   font-size: 10.5px;
//   opacity: 0.8;
//   color: ${({ $mine, theme }) =>
//     $mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary};
// `;

// const ReadState = styled.span<{ $mine: boolean; $read: boolean }>`
//   display: inline-flex;
//   width: 12px;
//   height: 12px;
//   border-radius: 999px;
//   background: ${({ $mine, $read }) =>
//     $mine && $read ? "#fff" : "transparent"};
//   border: ${({ $mine, $read }) =>
//     $mine && $read ? "none" : "1px solid transparent"};
// `;
