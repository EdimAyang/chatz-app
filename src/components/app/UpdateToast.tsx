import styled from "styled-components";
import { RefreshCw, X } from "lucide-react";

interface UpdateToastProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateToast({ onUpdate, onDismiss }: UpdateToastProps) {
  return (
    <Card role="status">
      <IconWrapper>
        <RefreshCw size={18} />
      </IconWrapper>

      <Content>
        <Title>Update available</Title>
        <Message>A new version of Chatz is ready to install.</Message>
      </Content>

      <Actions>
        <UpdateButton onClick={onUpdate}>Reload</UpdateButton>
        <DismissButton onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </DismissButton>
      </Actions>
    </Card>
  );
}

const Card = styled.div`
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 24px;
  z-index: 9999;

  max-width: 420px;
  margin: 0 auto;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 14px 14px 16px;

  background: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  animation: slide-up 0.25s ease-out;

  @keyframes slide-up {
    from {
      transform: translateY(16px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;

  width: 36px;
  height: 36px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: rgba(255, 69, 0, 0.15);
  color: #ff4500;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.p`
  margin: 0;

  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const Message = styled.p`
  margin: 2px 0 0;

  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.6);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const UpdateButton = styled.button`
  padding: 8px 14px;

  border: none;
  border-radius: 8px;

  background: #ff4500;
  color: white;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  &:hover {
    background: #e63e00;
  }
`;

const DismissButton = styled.button`
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border: none;
  border-radius: 50%;

  background: transparent;
  color: rgba(255, 255, 255, 0.5);

  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;