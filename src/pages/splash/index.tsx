import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { useAuthStore } from "@/store/auth.store";
import { PATHS } from "@/lib/paths";

const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary};
  gap: 18px;
`;
const Logo = styled(motion.div)`
  width: 104px;
  height: 104px;
  border-radius: 30px;
  background: linear-gradient(135deg, #ff4000 0%, #e63900 100%);
  box-shadow: ${({ theme }) => theme.shadows.orange};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
`;
const Brand = styled(motion.h1)`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Tag = styled(motion.p)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Splash = () => {
  const navigate = useNavigate();
  const { isOnboarded } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => {
      if (isOnboarded) {
        navigate(`${PATHS.AUTH.LOGIN}`, { replace: true });
      } else {
        navigate(`${PATHS.ONBOARDING.ONBOARDING}`, { replace: true });
      }
    }, 1900);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <MobileFrame>
      <Wrap>
        <Logo
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <MessageCircle
            size={52}
            strokeWidth={2.4}
            fill="rgba(255,255,255,0.15)"
          />
        </Logo>
        <Brand
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Chatz
        </Brand>
        <Tag
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Conversations, beautifully reimagined.
        </Tag>
      </Wrap>
    </MobileFrame>
  );
};

export default Splash;
