import { createPortal } from "react-dom";
import styled from "styled-components";

interface DeleteMessageDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteMessageDialog = ({
  open,
  onCancel,
  onConfirm,
}: DeleteMessageDialogProps) => {
  if (!open) return null;

  return createPortal(
    <DeleteOverlay onClick={onCancel}>
      <DeleteDialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-message-title"
        onClick={(event) => event.stopPropagation()}
      >
        <DeleteTitle id="delete-message-title">
          Delete message?
        </DeleteTitle>

        <DeleteText>
          Are you sure you want to delete this message?
        </DeleteText>

        <DeleteActions>
          <DeleteCancelButton
            type="button"
            onClick={onCancel}
          >
            Cancel
          </DeleteCancelButton>

          <DeleteConfirmButton
            type="button"
            onClick={onConfirm}
          >
            Delete
          </DeleteConfirmButton>
        </DeleteActions>
      </DeleteDialog>
    </DeleteOverlay>,
    document.body,
  );
};

export default DeleteMessageDialog;


const DeleteOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
`;

const DeleteDialog = styled.div`
  width: min(100%, 380px);

  padding: 24px;

  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);

  animation: deleteDialogIn 0.2s ease-out;

  @keyframes deleteDialogIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const DeleteTitle = styled.h3`
  margin: 0 0 8px;

  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DeleteText = styled.p`
  margin: 0;

  font-size: 14px;
  line-height: 1.5;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DeleteActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 24px;
`;

const DeleteCancelButton = styled.button`
  min-width: 90px;
  padding: 10px 16px;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;

  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};

  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const DeleteConfirmButton = styled.button`
  min-width: 90px;
  padding: 10px 16px;

  border: none;
  border-radius: 8px;

  background: ${({ theme }) => theme.colors.error};
  color: white;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.97);
  }
`;
