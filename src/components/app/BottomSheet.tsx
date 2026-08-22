import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

const Backdrop = styled(motion.div)`
  position: fixed; inset: 0; background: ${({ theme }) => theme.colors.overlay};
  z-index: 100; display: flex; align-items: flex-end; justify-content: center;
`;
const Sheet = styled(motion.div)`
  width: 100%; max-width: 460px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 28px 28px 0 0;
  padding: 14px 20px 28px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;
const Handle = styled.div`
  width: 44px; height: 5px; border-radius: 999px;
  background: ${({ theme }) => theme.colors.divider};
  margin: 4px auto 14px;
`;

export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <Backdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <Sheet
            onClick={e => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          >
            <Handle />
            {children}
          </Sheet>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}
