import styled from "styled-components";
import { StatusIcon } from "../MessageBubble";
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  ImageOff,
  X,
} from "lucide-react";
import type { MessageStatus } from "#/types";
import type { Dispatch, SetStateAction } from "react";
import { MessageContentWidth } from "./FileContent";

interface ImageContentProps {
  src: string;
  mine: boolean;
  time: string;
  isRead: boolean;
  status?: MessageStatus;
  isDeleted?: boolean;
  deleteTime: string | undefined;
  onClick?: () => void;
  viewingImage: boolean;
  setViewingImage: Dispatch<SetStateAction<boolean>>;
}
export const ImageContent = ({
  src,
  mine,
  time,
  isRead,
  status,
  isDeleted,
  deleteTime,
  onClick,
  viewingImage,
  setViewingImage,
}: ImageContentProps) => {
  return (
    <>
      {viewingImage && (
        <ImageViewer onClick={() => setViewingImage(false)}>
          <ImageViewerImage
            src={src}
            alt="Full size attachment"
            onClick={(event) => event.stopPropagation()}
          />

          <CloseImageButton
            type="button"
            onClick={() => setViewingImage(false)}
            aria-label="Close image"
          >
            <X size={24} />
          </CloseImageButton>
        </ImageViewer>
      )}

      <ImageContentWrapper $mine={mine} $deleted={!!isDeleted}>
        {" "}
        {!isDeleted ? (
          <>
            {" "}
            <PreviewImage src={src} alt="attachment" onClick={onClick} />{" "}
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
              <ImageOff size={17} />{" "}
            </DeletedIcon>{" "}
            <DeletedContent>
              {" "}
              <DeletedTitle>Photo deleted</DeletedTitle>{" "}
              <DeletedTime>deleted {deleteTime}</DeletedTime>{" "}
            </DeletedContent>{" "}
          </DeletedMedia>
        )}{" "}
      </ImageContentWrapper>
    </>
  );
};

const ImageViewer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(0, 0, 0, 0.92);

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

const ImageViewerImage = styled.img`
  display: block;

  max-width: 100%;
  max-height: 92vh;

  width: auto;
  height: auto;

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

const CloseImageButton = styled.button`
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

  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const ImageContentWrapper = styled.div<{ $mine: boolean; $deleted: boolean }>`
  position: relative;
  ${MessageContentWidth}
  // width: min(65vw, 300px);
  //  width:100%;
  overflow: hidden;
  border-radius: 15px;
  color: ${({ $mine }) =>
    $mine ? "rgba(255, 255, 255, 0.88)" : "rgba(60, 60, 60, 0.78)"};
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  opacity: ${({ $deleted }) => ($deleted ? 0.75 : 1)};
`;
const PreviewImage = styled.img`
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  cursor: pointer;

  transition:
    transform 0.2s ease,
    filter 0.2s ease;

  &:hover {
    filter: brightness(0.92);
  }

  &:active {
    transform: scale(0.98);
  }
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
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const DeletedContent = styled.div`
  min-width: 0;
`;
const DeletedTitle = styled.div`
  font-size: 13px;
  font-style: italic;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const DeletedTime = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  opacity: 0.65;
`;
const Time = styled.span<{ $mine: boolean }>`
  display: inline-flex;
  font-size: 10.5px;
  line-height: 1;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.92)" : theme.colors.textPrimary};
  opacity: 0.9;
`;
