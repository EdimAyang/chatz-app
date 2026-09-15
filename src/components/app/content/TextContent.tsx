import styled from "styled-components";
import { StatusIcon } from "../MessageBubble";
import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import type { MessageStatus } from "#/types";
import { MessageContentWidth } from "./FileContent";

interface TextContentProps {
  message: string;
  mine: boolean;
  time: string;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  editedTime?: string;
  status?: MessageStatus;
  deletedTime?: string;
}

export const TextContent = ({
  message,
  mine,
  time,
  isRead,
  isDeleted,
  isEdited,
  editedTime,
  status,
  deletedTime,
}: TextContentProps) => {
  return (
    <TextBubble $mine={mine} $deleted={isDeleted}>
      <TextMessage $deleted={isDeleted} $mine={mine}>
        {message}
      </TextMessage>

      <TextMeta>
        {isEdited && <EditedLabel>edited {editedTime}</EditedLabel>}

        {isDeleted && <EditedLabel>deleted {deletedTime}</EditedLabel>}

        {!isEdited && !isDeleted && <Time $mine={mine}>{time}</Time>}

        {mine && !isDeleted && (
          <StatusIcon $mine={mine} $read={isRead}>
            {status === "failed" ? (
              <AlertCircle size={12} />
            ) : status === "sending" ? (
              <Clock size={12} />
            ) : status === "read" ? (
              <CheckCheck size={12} />
            ) : (
              <Check size={12} />
            )}
          </StatusIcon>
        )}
      </TextMeta>
    </TextBubble>
  );
};

const Time = styled.span<{ $mine: boolean }>`
  display: inline-block;
  font-size: 10.5px;
  opacity: 0.8;
  color: ${({ $mine, theme }) =>
    $mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary};
`;

const TextBubble = styled.div<{
  $mine: boolean;
  $deleted: boolean;
}>`
  ${MessageContentWidth}
  //   max-width: min(100%, 320px);
  // width:100%;

  padding: 5px 5px;
  border-radius: 18px;
  border-bottom-right-radius: ${({ $mine }) => ($mine ? "4px" : "18px")};
  border-bottom-left-radius: ${({ $mine }) => ($mine ? "18px" : "4px")};

  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming};

  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};

  //   box-shadow: ${({ theme }) => theme.shadows.sm};

  opacity: ${({ $deleted }) => ($deleted ? 0.7 : 1)};
`;

export const TextMessage = styled.div<{ $deleted: boolean; $mine: boolean }>`
  padding: 0px;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  font-style: ${({ $deleted }) => ($deleted ? "italic" : "normal")};
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
`;

const TextMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 3px;
`;

export const EditedLabel = styled.span`
  font-size: 10px;
  opacity: 0.7;
`;
