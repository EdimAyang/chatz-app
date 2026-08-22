import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const Wrap = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  left: 50%;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: #fff;
  padding: 12px 18px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 200;
`;
export function Toast({ message, show }: { message?: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <Wrap
          initial={{ y: 20, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 20, opacity: 0, x: "-50%" }}
        >
          <CheckCircle2 size={18} color="#34C759" /> {message}
        </Wrap>
      )}
    </AnimatePresence>
  );
}
