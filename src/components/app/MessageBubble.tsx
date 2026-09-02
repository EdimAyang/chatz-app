import styled from "styled-components";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  padding: 2px 5px;
`;
const Bubble = styled(motion.div)<{ $mine: boolean }>`
  max-width: 78%;
  background: ${({ $mine, theme }) => ($mine ? theme.colors.bubbleOutgoing : theme.colors.bubbleIncoming)};
  color: ${({ $mine, theme }) => ($mine ? "#fff" : theme.colors.textPrimary)};
  padding: 10px 14px 8px;
  border-radius: 22px;
  border-bottom-right-radius: ${({ $mine }) => ($mine ? "8px" : "22px")};
  border-bottom-left-radius: ${({ $mine }) => ($mine ? "22px" : "8px")};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  font-size: 15px;
  line-height: 1.35;
  word-wrap: break-word;
`;
const Meta = styled.div<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
`;
const Time = styled.span<{ $mine: boolean }>`
  display: inline-block;
  font-size: 10.5px;
  opacity: 0.7;
  color: ${({ $mine, theme }) => ($mine ? "rgba(255,255,255,0.9)" : theme.colors.textSecondary)};
`;
const StatusIcon = styled.span<{ $mine: boolean; $read: boolean }>`
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
const ImgWrap = styled.div`
  border-radius: 18px;
  overflow: hidden;
  margin: -4px -6px 4px;
  img { display: block; width: 100%; max-width: 260px; }
`;

export function MessageBubble({
  mine,
  text,
  time,
  image,
  isRead,
}: {
  mine: boolean;
  text?: string;
  time: string;
  image?: string;
  isRead?: boolean;
}) {
  return (
    <Row $mine={mine}>
      <Bubble
        $mine={mine}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {image && <ImgWrap><img src={image} alt="" /></ImgWrap>}
        {text && <span>{text}</span>}
        <Meta $mine={mine}>
          <Time $mine={mine}>{time}</Time>
          {mine && (
            <StatusIcon $mine={mine} $read={Boolean(isRead)}>
              {isRead ? <CheckCheck size={12} /> : <Check size={12} />}
            </StatusIcon>
          )}
        </Meta>
      </Bubble>
    </Row>
  );
}
