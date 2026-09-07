import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import {
  X,
  Sparkles,
  Check,
  ArrowUpRight,
} from "lucide-react";
import styled from "styled-components";

type UpdateFeature = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type WhatsNewModalProps = {
  title: string;
  version: string;
  features: UpdateFeature[];
  onClose: () => void;
};

export function WhatsNewModal({
  title,
  version,
  features,
  onClose,
}: WhatsNewModalProps) {
  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Modal
          initial={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 10,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 28,
          }}
        >
          {/* Close */}
          <CloseButton
            onClick={onClose}
            aria-label="Close"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <X size={18} />
          </CloseButton>

          {/* Header */}
          <Header>
            <IconWrapper
              initial={{ scale: 0, rotate: -15 }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 300,
              }}
            >
              <Sparkles size={27} />
            </IconWrapper>

            <Title>{title}</Title>

            <Subtitle>
              We've made some improvements to make Chatz
              even better.
            </Subtitle>

            <VersionBadge>
              <span>v{version}</span>
              <ArrowUpRight size={13} />
            </VersionBadge>
          </Header>

          {/* Features */}
          <Features>
            {features.map((feature, index) => (
              <Feature
                key={feature.title}
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25 + index * 0.08,
                  duration: 0.3,
                }}
              >
                <FeatureIcon>
                  {feature.icon ?? <Check size={16} />}
                </FeatureIcon>

                <FeatureContent>
                  <FeatureTitle>
                    {feature.title}
                  </FeatureTitle>

                  <FeatureDescription>
                    {feature.description}
                  </FeatureDescription>
                </FeatureContent>
              </Feature>
            ))}
          </Features>

          {/* Footer */}
          <Footer>
            <GotItButton
              onClick={onClose}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              Got it
              <ArrowUpRight size={17} />
            </GotItButton>
          </Footer>
        </Modal>
      </Overlay>
    </AnimatePresence>
  );
}

/* =========================
   STYLES
========================= */

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: ${({ theme }) => theme.colors.overlay};

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
`;

const Modal = styled(motion.div)`
  position: relative;

  width: 100%;
  max-width: 470px;

  max-height: calc(100vh - 40px);

  overflow-y: auto;

  padding: 32px;

  border-radius: 24px;

  background: ${({ theme }) => theme.colors.surface};

  border: 1px solid ${({ theme }) => theme.colors.border};

  box-shadow: ${({ theme }) => theme.shadows.lg};

  scrollbar-width: thin;

  @media (max-width: 520px) {
    padding: 26px 20px;
    border-radius: 20px;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;

  top: 18px;
  right: 18px;

  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;

  background: ${({ theme }) => theme.colors.background};

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondarySoft};
    color: ${({ theme }) => theme.colors.secondary};
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  padding: 4px 20px 24px;
`;

const IconWrapper = styled(motion.div)`
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 18px;

  border-radius: 18px;

  color: ${({ theme }) => theme.colors.secondary};

  background: ${({ theme }) => theme.colors.secondarySoft};

  border: 1px solid
    ${({ theme }) => theme.colors.secondary};

  box-shadow: ${({ theme }) => theme.shadows.orange};
`;

const Title = styled.h2`
  margin: 0;

  font-size: 24px;
  line-height: 1.2;

  font-weight: 700;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  max-width: 350px;

  margin: 10px 0 14px;

  font-size: 14px;
  line-height: 1.6;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const VersionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  padding: 5px 10px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.secondary};

  background: ${({ theme }) => theme.colors.secondarySoft};

  border: 1px solid
    ${({ theme }) => theme.colors.secondary};

  svg {
    stroke-width: 2.5;
  }
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;

  gap: 10px;
`;

const Feature = styled(motion.div)`
  display: flex;
  align-items: flex-start;

  gap: 13px;

  padding: 14px;

  border-radius: 14px;

  background: ${({ theme }) => theme.colors.background};

  border: 1px solid ${({ theme }) => theme.colors.border};

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);

    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FeatureIcon = styled.div`
  flex-shrink: 0;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 1px;

  border-radius: 9px;

  color: #ffffff;

  background: ${({ theme }) => theme.colors.secondary};

  box-shadow: ${({ theme }) => theme.shadows.orange};

  svg {
    stroke-width: 2.5;
  }
`;

const FeatureContent = styled.div`
  min-width: 0;
`;

const FeatureTitle = styled.h3`
  margin: 0 0 3px;

  font-size: 14px;
  font-weight: 650;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const FeatureDescription = styled.p`
  margin: 0;

  font-size: 12.5px;
  line-height: 1.5;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Footer = styled.div`
  margin-top: 22px;
`;

const GotItButton = styled(motion.button)`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  height: 46px;

  border: none;
  border-radius: 13px;

  color: #ffffff;

  background: ${({ theme }) => theme.colors.secondary};

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  box-shadow: ${({ theme }) => theme.shadows.orange};

  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondaryDark};

    box-shadow: ${({ theme }) => theme.shadows.orange};
  }

  &:active {
    background: ${({ theme }) => theme.colors.secondaryDark};
  }
`;