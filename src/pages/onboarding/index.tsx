import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, PhoneCall, Share2 } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { PATHS } from "@/lib/paths";
import { useAuthStore } from "@/store/auth.store";

const slides = [
  {
    icon: MessageCircle,
    title: "Connect Instantly",
    desc: "Chat with friends and family from anywhere in the world.",
    color: "#FFE4EF",
  },
  {
    icon: PhoneCall,
    title: "Crystal Clear Calls",
    desc: "Enjoy high-quality voice and video calls.",
    color: "#E0F7EC",
  },
  {
    icon: Share2,
    title: "Share Everything",
    desc: "Send photos, videos, documents and voice notes securely.",
    color: "#FFF1E0",
  },
];

const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px 32px;
`;
const Top = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const Skip = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  padding: 12px;
`;
const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 24px;
`;
const Illu = styled(motion.div)<{ $bg: string }>`
  width: 220px;
  height: 220px;
  border-radius: 60px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.secondary};
`;
const Title = styled(motion.h2)`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Desc = styled(motion.p)`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 300px;
`;
const Dots = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 20px 0 24px;
`;
const Dot = styled(motion.div)<{ $active: boolean }>`
  height: 8px;
  border-radius: 999px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.divider};
`;

const Onboarding = () => {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = slides[i];
  const last = i === slides.length - 1;
  const Icon = slide.icon;

  const next = () =>
    last ? navigate(`${PATHS.AUTH.LOGIN}`, { replace: true }) : setI(i + 1);

  const { isOnboarded } = useAuthStore();
  if (isOnboarded) {
    return <Navigate to={PATHS.AUTH.LOGIN} replace={true} />;
  }

  return (
    <MobileFrame>
      <Wrap>
        <Top>
          <Skip
            onClick={() => navigate(`${PATHS.AUTH.LOGIN}`, { replace: true })}
          >
            Skip
          </Skip>
        </Top>
        <Body>
          <AnimatePresence mode="wait">
            <Illu
              key={`illu-${i}`}
              $bg={slide.color}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <Icon size={88} strokeWidth={1.8} />
            </Illu>
            <Title
              key={`t-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {slide.title}
            </Title>
            <Desc
              key={`d-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.04 }}
            >
              {slide.desc}
            </Desc>
          </AnimatePresence>
        </Body>
        <Dots>
          {slides.map((_, idx) => (
            <Dot
              key={idx}
              $active={idx === i}
              animate={{ width: idx === i ? 28 : 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            />
          ))}
        </Dots>
        <Button full onClick={next}>
          {last ? "Get Started" : "Next"}
        </Button>
      </Wrap>
    </MobileFrame>
  );
};

export default Onboarding;
