import { MessageType } from "#/lib/constants";
import { MessageBubble } from "./MessageBubble";
import { formatTime } from "#/utils/dates";
import { AudioBubble } from "./AudioBubble";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";

interface MessageRendererProps {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    duration: number | null;
    messageType: MessageType;
    attachmentUrl: string | null;
    attachmentPublicId: string | null;
    mimeType: string | null;
  };
  mine: boolean;
}

export const MessageRenderer = ({ message, mine }: MessageRendererProps) => {
  switch (message.messageType) {
    case MessageType.TEXT:
      return (
        <MessageBubble
          mine={mine}
          text={message.message ?? ""}
          time={formatTime(message.createdAt)}
          image=""
          isRead={message.isRead}
        />
      );

    case MessageType.IMAGE:
      return (
        <Row $mine={mine}>
          <ImageBubble $mine={mine}>
            <PreviewImage src={message.attachmentUrl ?? ""} alt="attachment" />
            <MetaRow $mine={mine}>
              <Time $mine={mine}>{formatTime(message.createdAt)}</Time>
              {mine && (
                <ReadState $mine={mine} $read={Boolean(message.isRead)} />
              )}
            </MetaRow>
          </ImageBubble>
        </Row>
      );

    case MessageType.AUDIO:
      return (
        <AudioBubble
          mine={mine}
          audio={message.attachmentUrl ?? ""}
          duration={message.duration ?? 0}
          time={formatTime(message.createdAt)}
        />
      );

    case MessageType.VIDEO:
      return (
        <Row $mine={mine}>
          <VideoBubble $mine={mine}>
            <VideoPreview controls src={message.attachmentUrl ?? ""} />
            <MetaRow $mine={mine}>
              <Time $mine={mine}>{formatTime(message.createdAt)}</Time>
              {mine && (
                <ReadState $mine={mine} $read={Boolean(message.isRead)} />
              )}
            </MetaRow>
          </VideoBubble>
        </Row>
      );

    case MessageType.FILE:
      return (
        <Row $mine={mine}>
          <FileBubble
            $mine={mine}
            href={message.attachmentUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            <FileIconWrap $mine={mine}>
              <FileText size={18} />
            </FileIconWrap>
            <FileInfo>
              <FileName>{message.message || "Attachment"}</FileName>
              <FileMeta>Document</FileMeta>
            </FileInfo>
            <Download size={16} />
            <MetaRow $mine={mine}>
              <Time $mine={mine}>{formatTime(message.createdAt)}</Time>
              {mine && (
                <ReadState $mine={mine} $read={Boolean(message.isRead)} />
              )}
            </MetaRow>
          </FileBubble>
        </Row>
      );

    default:
      return null;
  }
};

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  padding: 2px 16px;
`;

const ImageBubble = styled(motion.div)<{ $mine: boolean }>`
  max-width: min(78%, 280px);
  overflow: hidden;
  border-radius: 22px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PreviewImage = styled.img`
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: cover;
`;

const VideoBubble = styled(motion.div)<{ $mine: boolean }>`
  max-width: min(78%, 320px);
  border-radius: 22px;
  overflow: hidden;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const VideoPreview = styled.video`
  display: block;
  width: 100%;
  max-height: 260px;
  background: #000;
`;

const FileBubble = styled.a<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(78%, 300px);
  padding: 12px 14px;
  border-radius: 22px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-decoration: none;
  flex-wrap: wrap;
`;

const FileIconWrap = styled.div<{ $mine: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.18)" : "#FFE4EF")};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.secondary)};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileMeta = styled.div`
  font-size: 11px;
  opacity: 0.72;
  margin-top: 2px;
`;

const MetaRow = styled.div<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  padding: 10px 10px 8px;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary};
`;

const Time = styled.span<{ $mine: boolean }>`
  display: inline-block;
  font-size: 10.5px;
  opacity: 0.8;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary};
`;

const ReadState = styled.span<{ $mine: boolean; $read: boolean }>`
  display: inline-flex;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${({ $mine, $read }) =>
    $mine && $read ? "#fff" : "transparent"};
  border: ${({ $mine, $read }) =>
    $mine && $read ? "none" : "1px solid transparent"};
`;
