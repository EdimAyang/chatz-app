import styled from "styled-components";
import { motion } from "framer-motion";

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  padding: 2px 16px;
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
const Time = styled.span<{ $mine: boolean }>`
  display: block;
  font-size: 10.5px;
  margin-top: 4px;
  text-align: right;
  opacity: 0.7;
  color: ${({ $mine }) => ($mine ? "rgba(255,255,255,0.9)" : "#7A7A7A")};
`;
const ImgWrap = styled.div`
  border-radius: 18px;
  overflow: hidden;
  margin: -4px -6px 4px;
  img { display: block; width: 100%; max-width: 260px; }
`;

export function MessageBubble({ mine, text, time, image }: { mine: boolean; text?: string; time: string; image?: string }) {
  // console.log(mine, text, time)
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
        <Time $mine={mine}>{time}</Time>
      </Bubble>
    </Row>
  );
}
