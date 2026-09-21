import styled from "styled-components";
import { StatusIcon } from "../MessageBubble";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  VideoOff,
  X,
} from "lucide-react";
import type { MessageStatus } from "#/types";
import { type Dispatch, type SetStateAction } from "react";
import { MessageContentWidth } from "./FileContent";
import { createPortal } from "react-dom";

interface VideoContentProps {
  src: string;
  mine: boolean;
  time: string;
  isRead: boolean;
  status: MessageStatus;
  isDeleted?: boolean;
  deleteTime: string | undefined;
  onViewVideo: () => void;
  viewingVideo: boolean;
  setViewingVideo: Dispatch<SetStateAction<boolean>>;
}

export const VideoContent = ({
  src,
  mine,
  time,
  isRead,
  status,
  isDeleted,
  deleteTime,
  onViewVideo,
  viewingVideo,
  setViewingVideo,
}: VideoContentProps) => {
  console.log(status, isRead);

  return (
    <>
      {viewingVideo &&
        createPortal(
          <VideoViewer onClick={() => setViewingVideo(false)}>
            <VideoViewerPlayer
              src={src}
              controls
              autoPlay
              playsInline
              onClick={(event) => {
                event.stopPropagation();
              }}
            />

            <CloseVideoButton
              type="button"
              onClick={() => setViewingVideo(false)}
              aria-label="Close video"
            >
              <X size={24} />
            </CloseVideoButton>
          </VideoViewer>,
          document.body,
        )}

      <VideoContentWrapper
        $mine={mine}
        $deleted={!!isDeleted}
        onClick={() => {
          onViewVideo?.();
          setViewingVideo(true);
        }}
      >
        {" "}
        {!isDeleted ? (
          <>
            {" "}
            <VideoPreview src={src} playsInline muted preload="metadata"/>{" "}
            <MediaMetaOverlay>
              {" "}
              <Time $mine={mine}>{time}</Time>{" "}
              {mine && (
                <StatusIcon $mine={mine} $read={isRead}>
                  {" "}
                  {status === "failed" ? (
                    <AlertCircle size={12} />
                  ) : status === "sending" ? (
                    <Clock size={12} />
                  ) : isRead ? (
                    <CheckCheck size={12} />
                  ) : status === "sent" ? (
                    <Check size={12} />
                  ) : (
                    <Check size={12} />
                  )}{" "}
                </StatusIcon>
              )}{" "}
            </MediaMetaOverlay>{" "}
          </>
        ) : (
          <DeletedMedia>
            {" "}
            <DeletedIcon>
              {" "}
              <VideoOff size={17} />{" "}
            </DeletedIcon>{" "}
            <DeletedContent>
              {" "}
              <DeletedTitle>Video deleted</DeletedTitle>{" "}
              <DeletedTime>deleted {deleteTime}</DeletedTime>{" "}
            </DeletedContent>{" "}
          </DeletedMedia>
        )}{" "}
      </VideoContentWrapper>
    </>
  );
};

const VideoViewer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(0, 0, 0, 0.94);

  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const VideoViewerPlayer = styled.video`
  display: block;

  width: auto;
  height: auto;

  max-width: 100%;
  max-height: 92vh;

  object-fit: contain;

  border-radius: 4px;

  animation: zoomIn 0.2s ease;

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.94);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const CloseVideoButton = styled.button`
  position: fixed;
  top: 18px;
  right: 18px;

  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.12);
  color: white;

  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const VideoContentWrapper = styled.div<{ $mine: boolean; $deleted: boolean }>`
  ${MessageContentWidth}
  position: relative;
  // width: min(65vw, 320px);
  //  width:100%;
  overflow: hidden;
  border-radius: 15px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  opacity: ${({ $deleted }) => ($deleted ? 0.75 : 1)};
  user-select: none;
  -webkit-user-select: none;

  /*
    Let the MessageBubble/BubbleWrapper handle
    horizontal swipe gestures.
  */
  touch-action: pan-y;
`;
const VideoPreview = styled.video`
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  cursor: pointer;
  pointer-events: none;

  user-select: none;
  -webkit-user-select: none;

  -webkit-touch-callout: none;
`;

const MediaMetaOverlay = styled.div`
  position: absolute;
  right: 8px;
  bottom: 7px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
`;
const Time = styled.span<{ $mine: boolean }>`
  display: inline-flex;
  font-size: 10.5px;
  line-height: 1;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.92)" : theme.colors.textSecondary};
  opacity: 0.9;
`;
const DeletedMedia = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 12px 14px;
`;
const DeletedIcon = styled.div`
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.12);
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const DeletedContent = styled.div`
  min-width: 0;
`;
const DeletedTitle = styled.div`
  font-size: 13px;
  font-style: italic;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const DeletedTime = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.65;
`;
