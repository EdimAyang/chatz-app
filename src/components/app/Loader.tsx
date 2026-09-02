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
  background: linear-gradient(
    90deg,
    ${({ theme }) => `${theme.colors.surface}40`} 0%,
    ${({ theme }) => `${theme.colors.surface}80`} 50%,
    ${({ theme }) => `${theme.colors.surface}40`} 100%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => `${theme.colors.border}40`};
  box-shadow: inset 0 1px 0 ${({ theme }) => `${theme.colors.border}20`};
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

// Skeleton loaders
const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const ConversationCardSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarSkeleton = styled(Skeleton)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const TextSkeletonContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ConversationCardSkeleton = () => (
  <ConversationCardSkeletonWrapper>
    <AvatarSkeleton $h={48} $w="48px" $r={999} />
    <TextSkeletonContainer>
      <Skeleton $h={16} $w="60%" />
      <Skeleton $h={12} $w="80%" />
    </TextSkeletonContainer>
  </ConversationCardSkeletonWrapper>
);

export const ConversationListSkeleton = () => (
  <SkeletonWrapper>
    {Array.from({ length: 8 }).map((_, i) => (
      <ConversationCardSkeleton key={i} />
    ))}
  </SkeletonWrapper>
);

const UserCardSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
`;

export const UserCardSkeleton = () => (
  <UserCardSkeletonWrapper>
    <AvatarSkeleton $h={44} $w="44px" $r={999} />
    <TextSkeletonContainer>
      <Skeleton $h={15} $w="70%" />
    </TextSkeletonContainer>
  </UserCardSkeletonWrapper>
);

export const UserListSkeleton = () => (
  <SkeletonWrapper>
    {Array.from({ length: 12 }).map((_, i) => (
      <UserCardSkeleton key={i} />
    ))}
  </SkeletonWrapper>
);

const MessageSkeletonWrapper = styled.div<{ $isOwn?: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  padding: 4px 16px 8px;
`;

const MessageBubbleSkeleton = styled(Skeleton)<{ $isOwn?: boolean }>`
  width: ${({ $isOwn }) => ($isOwn ? "40%" : "50%")};
  height: 60px;
  border-radius: 22px;
`;

export const MessageSkeleton = ({ isOwn }: { isOwn?: boolean }) => (
  <MessageSkeletonWrapper $isOwn={isOwn}>
    <MessageBubbleSkeleton $isOwn={isOwn} />
  </MessageSkeletonWrapper>
);

export const MessageListSkeleton = () => (
  <SkeletonWrapper style={{ padding: "12px 0" }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <MessageSkeleton key={i} isOwn={i % 2 === 0} />
    ))}
  </SkeletonWrapper>
);

const HeaderSkeletonWrapper = styled.div`
  flex-shrink: 0;
  z-index: 10;
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
`;

export const ChatHeaderSkeleton = () => (
  <HeaderSkeletonWrapper>
    <AvatarSkeleton $h={40} $w="40px" $r={999} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <Skeleton $h={15} $w="60%" />
      <Skeleton $h={12} $w="40%" />
    </div>
  </HeaderSkeletonWrapper>
);
