import styled from "styled-components";
import { MessageSquare } from "lucide-react";

const DesktopEmptyChat = () => {
  return (
    <EmptyChat>
      <EmptyIcon>
        <MessageSquare size={42} />
      </EmptyIcon>

      <Title>Chatz</Title>

      <Description>
        Select a conversation to start chatting.
      </Description>
    </EmptyChat>
  );
};

export default DesktopEmptyChat;

const EmptyChat = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 767px) {
    display: none;
  }
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  margin: 18px 0 6px;

  font-size: 24px;
  font-weight: 700;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Description = styled.p`
  margin: 0;

  font-size: 14px;
`;