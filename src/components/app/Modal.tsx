import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

const Back = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;
const Card = styled(motion.div)`
  width: 100%;
  max-width: 360px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 26px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Back
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            {children}
          </Card>
        </Back>
      )}
    </AnimatePresence>
  );
}
