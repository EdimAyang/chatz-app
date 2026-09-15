import type { ChatMessage, MessageStatus } from "#/types";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  FileX,
} from "lucide-react";
import styled from "styled-components";
import { StatusIcon } from "../MessageBubble";

interface FileContentProps {
  message: ChatMessage;
  mine: boolean;
  time: string;
  isRead: boolean;
  status?: MessageStatus;
  isDeleted: boolean;
  deleteTime: string;
}

export const FileContent = ({
  message,
  mine,
  time,
  isRead,
  status,
  isDeleted,
  deleteTime,
}: FileContentProps) => {
  return (
    <FileContentWrapper
      $mine={mine}
      $deleted={isDeleted}
      href={isDeleted ? undefined : (message.attachmentUrl ?? "#")}
      target={isDeleted ? undefined : "_blank"}
      rel="noreferrer"
      onClick={(event) => {
        if (isDeleted) {
          event.preventDefault();
        }
      }}
    >
      {" "}
      {!isDeleted ? (
        <>
          {" "}
          <FileIconWrap $mine={mine}>
            {" "}
            <FileText size={19} />{" "}
          </FileIconWrap>{" "}
          <FileInfo>
            {" "}
            <FileName> {message.message || "Attachment"} </FileName>{" "}
            <FileMeta>Document</FileMeta>{" "}
          </FileInfo>{" "}
          <DownloadIcon $mine={mine}>
            {" "}
            <Download size={17} />{" "}
          </DownloadIcon>{" "}
          <FileMetaRow>
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
          </FileMetaRow>{" "}
        </>
      ) : (
        <DeletedMedia>
          {" "}
          <DeletedIcon>
            {" "}
            <FileX size={17} />{" "}
          </DeletedIcon>{" "}
          <DeletedContent>
            {" "}
            <DeletedTitle>Document deleted</DeletedTitle>{" "}
            <DeletedTime>deleted {deleteTime}</DeletedTime>{" "}
          </DeletedContent>{" "}
        </DeletedMedia>
      )}{" "}
    </FileContentWrapper>
  );
};

export const MessageContentWidth = `
  width: fit-content;
  max-width: min(420px, 75vw);
  box-sizing: border-box;

  @media (max-width: 480px) {
    max-width: 82vw;
  }

  @media (min-width: 481px) and (max-width: 1023px) {
    max-width: 55vw;
  }

  @media (min-width: 1024px) {
    max-width: 420px;
  }
`;
const FileContentWrapper = styled.a<{ $mine: boolean; $deleted: boolean }>`
  ${MessageContentWidth}
  position: relative;
  display: flex;
  align-items: center;
  gap: 30px;
  // max-width: 300px;
  // width: 100%;
  // min-height: 64px;
  padding: 10px 12px;
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
  text-decoration: none;
  border-radius: 14px;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};
  opacity: ${({ $deleted }) => ($deleted ? 0.75 : 1)};
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;
const FileIconWrap = styled.div<{ $mine: boolean }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: ${({ $mine }) =>
    $mine ? "rgba(255,255,255,0.18)" : "rgba(250,84,156,0.1)"};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.secondary)};
`;
const DownloadIcon = styled.div<{ $mine: boolean }>`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.9)" : "inherit")};
  opacity: 0.8;
`;
const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
`;
const FileName = styled.div`
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const FileMeta = styled.div`
  margin-top: 3px;
  font-size: 11px;
  opacity: 0.65;
`;
const FileMetaRow = styled.div`
  position: absolute;
  right: 12px;
  bottom: 7px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const Time = styled.span<{ $mine: boolean }>`
  display: inline-flex;
  font-size: 10.5px;
  line-height: 1;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.9)" : theme.colors.textPrimary};
  opacity: 0.8;
`;
const DeletedMedia = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
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
