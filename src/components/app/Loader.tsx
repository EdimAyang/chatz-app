import styled, { keyframes } from "styled-components";

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Loader = styled.div<{ $size?: number }>`
  width: ${({ $size = 28 }) => $size}px;
  height: ${({ $size = 28 }) => $size}px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.secondarySoft};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  animation: ${spin} 0.9s linear infinite;
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;
export const Skeleton = styled.div<{ $h?: number; $w?: string; $r?: number }>`
  height: ${({ $h = 14 }) => $h}px;
  width: ${({ $w = "100%" }) => $w};
  border-radius: ${({ $r = 8 }) => $r}px;
  background: linear-gradient(90deg, #eee 0%, #f6f6f6 50%, #eee 100%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;


// const pulse = keyframes`
//   0%, 100% {
//     transform: scale(1);
//     opacity: 0.6;
//   }

//   50% {
//     transform: scale(1.08);
//     opacity: 1;
//   }
// `;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-6px);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

// const LogoWrapper = styled.div`
//   width: 72px;
//   height: 72px;
//   border-radius: 22px;

//   display: flex;
//   align-items: center;
//   justify-content: center;

//   background: ${({ theme }) => theme.colors.secondary};

//   animation: ${pulse} 2s ease-in-out infinite;

//   box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
// `;

// const Logo = styled.span`
//   color: white;
//   font-size: 32px;
//   font-weight: 800;
//   font-family: ${({ theme }) => theme.font || "Inter"};
// `;

// const Text = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 6px;
// `;

// const Title = styled.h1`
//   margin: 0;
//   font-size: 22px;
//   font-weight: 700;
//   letter-spacing: -0.5px;
// `;

// const Subtitle = styled.p`
//   margin: 0;
//   font-size: 14px;
//   color: ${({ theme }) => theme.colors.textSecondary};
// `;

const Dots = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const Dot = styled.span<{ delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};

  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay}s;
`;

export const LoadingScreen = () => {
  return (
    <Container>
      <Content>
        {/* <LogoWrapper>
          <Logo>C</Logo>
        </LogoWrapper> */}

        {/* <Text>
          <Title>Chatz</Title>
          <Subtitle>Connecting you to your conversations</Subtitle>
        </Text> */}

        <Dots>
          <Dot delay={0} />
          <Dot delay={0.15} />
          <Dot delay={0.3} />
        </Dots>
      </Content>
    </Container>
  );
};