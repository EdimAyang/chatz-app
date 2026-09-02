import { ArrowLeft, ChevronDown } from "lucide-react";
import { Fragment, useMemo, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Avatar } from "@/components/app/Avatar";
// import { MobileFrame } from "@/components/app/MobileFrame";
import { useAudioRecorder } from "#/hooks/useAudioRecorder";
import ChatInput from "@/components/app/chatInput";
import { useGetMessageQuery } from "@/hooks/queries/useGetMessage";
import { useUserProfile } from "@/store/auth.store";
import { useWebSocketStore } from "@/store/websocket.store";
import { formatMessageDate, formatTime } from "@/utils/dates";
import { useGetUserQuery } from "#/hooks/queries/useUsers";
import { AnimatePresence, motion } from "framer-motion";
import { useNewMsgTrigger } from "#/hooks/useNewMessageTrigger";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageRenderer } from "./messageRenderer";
import { PATHS } from "#/lib/paths";
import { SocketEvent } from "#/lib/constants";
import {
  ChatHeaderSkeleton,
  MessageListSkeleton,
} from "#/components/app/Loader";

type ChatPageProps = {
  conversationId?: string;
  recipientId?: string;
};

export default function ChatPage({
  conversationId,
  recipientId,
}: ChatPageProps) {
  const { profile } = useUserProfile();
  console.log(conversationId, recipientId, "conversationId, recipientId");

  const { data, isLoading } = useGetMessageQuery(conversationId ?? "", "100");
  const { data: userData, isLoading: isUserLoading } = useGetUserQuery(
    recipientId ?? "",
  );

  const createdConversationId = useWebSocketStore(
    (state) => state.createdConversationId,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (createdConversationId) {
      navigate(`${PATHS.CHAT.CHAT(conversationId ?? "")}`);
    }
  }, [createdConversationId]);

  const firstPage = data?.pages?.[0];

  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    audioUrl,
    duration,
    resetAudio,
  } = useAudioRecorder();

  const { typingKey, typingUserId, send } = useWebSocketStore();

  const isTyping =
    typingKey === conversationId && typingUserId !== profile?.data.id;

  const ourMessages = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages) ?? [];
  }, [data]);

  const markedReadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId || !profile?.data.id) return;

    const unreadMessages = ourMessages.filter(
      (message) =>
        message.senderId !== profile.data.id &&
        message.isRead === false &&
        !markedReadRef.current.has(message.id),
    );

    if (!unreadMessages.length) return;

    unreadMessages.forEach((message) => {
      markedReadRef.current.add(message.id);
    });

    unreadMessages.forEach((message) => {
      send({
        type: SocketEvent.READ_RECEIPT,
        conversationId,
        messageId: message.id,
      });
    });
  }, [conversationId, profile?.data.id, ourMessages, send]);

  const { isAtBottom, scrollToBottom, handleScroll, bottomRef, containerRef } =
    useNewMsgTrigger(data ?? []);

  const RecipientAvatar = firstPage?.recipient?.user?.avatarUrl ?? "";
  const RecipientName = firstPage?.recipient?.user?.username ?? "";
  const RecipientLastSeen = firstPage?.recipient?.user?.lastSeen ?? "";
  const RecipientIsOnline = firstPage?.recipient?.user?.isOnline ?? false;

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (isAtBottom && isTyping) {
      scrollToBottom();
    }
  }, [ourMessages, isTyping, isAtBottom]);

  return (
    <ChatLayout>
      {isUserLoading || isLoading ? (
        <>
          <ChatHeaderSkeleton />
          <MessageListSkeleton />
        </>
      ) : (
        <>
          {userData ? (
            <Header>
              <Back onClick={() => window.history.back()} aria-label="Back">
                <ArrowLeft size={20} />
              </Back>
              <Avatar
                src={userData?.data.avatar || ""}
                size={40}
                online={userData?.data.isOnline}
              />
              <Who>
                <Name>{userData?.data.username || ""}</Name>
                <Status>
                  {userData?.data.isOnline
                    ? "online now"
                    : formatTime(userData?.data?.lastSeen || "")}
                </Status>
              </Who>
              {/* <HBtn aria-label="Voice call">
            <Phone size={18} />
          </HBtn>
          <HBtn aria-label="Video call">
            <Video size={18} />
          </HBtn> */}
            </Header>
          ) : (
            <Header>
              <Back onClick={() => window.history.back()} aria-label="Back">
                <ArrowLeft size={20} />
              </Back>
              <Avatar
                src={RecipientAvatar || ""}
                size={40}
                online={RecipientIsOnline || false}
              />
              <Who>
                <Name>{RecipientName || ""}</Name>
                <Status>
                  {RecipientIsOnline || false
                    ? "online now"
                    : formatTime(RecipientLastSeen || "")}
                </Status>
              </Who>
              {/* <HBtn aria-label="Voice call">
            <Phone size={18} />
          </HBtn>
          <HBtn aria-label="Video call">
            <Video size={18} />
          </HBtn> */}
            </Header>
          )}
          {ourMessages.length > 0 && (
            <Scroll ref={containerRef} onScroll={() => handleScroll()}>
              {ourMessages.map((m, index) => {
                const previous = ourMessages[index - 1];

                const showDate =
                  !previous ||
                  formatMessageDate(previous.createdAt) !==
                    formatMessageDate(m.createdAt);

                return (
                  <Fragment key={m.id}>
                    {showDate && (
                      <DateDiv>
                        <DateChip>{formatMessageDate(m.createdAt)}</DateChip>
                      </DateDiv>
                    )}

                    <MessageRenderer
                      message={m}
                      mine={m.senderId === profile?.data.id}
                    />
                  </Fragment>
                );
              })}

              {isTyping && (
                <TypingRow>
                  <TypingBubble>
                    <TDot $i={0} />
                    <TDot $i={1} />
                    <TDot $i={2} />
                  </TypingBubble>
                </TypingRow>
              )}

              {!isAtBottom && (
                <AnimatePresence>
                  <UnreadBtn
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={() => scrollToBottom()}
                  >
                    <ChevronDown size={14} />
                  </UnreadBtn>
                </AnimatePresence>
              )}
              <div ref={bottomRef}></div>
            </Scroll>
          )}
        </>
      )}

      <ChatInput
        conversationId={conversationId ?? ""}
        startRecording={startRecording}
        isRecording={isRecording}
        audioUrl={audioUrl}
        duration={duration}
        resetAudio={resetAudio}
        audioBlob={audioBlob}
        stopRecording={stopRecording}
        recipientId={recipientId ?? ""}
        scrollToBottom={scrollToBottom}
        isAtBottom={isAtBottom}
      />
    </ChatLayout>
  );
}

//styles

const ChatLayout = styled.div`
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 100dvh;
  overflow: hidden;

  @media (max-width: 767px) {
    height: 100%;
    max-height: none;
  }
`;

const Header = styled.header`
	flex-shrink: 0;
  z-index: 10;
  background:  ${({ theme }) => theme.colors.background});
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width:100%;
  position: fixed;
  left: 0;
  
`;
const Back = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const Who = styled.div`
  flex: 1;
  min-width: 0;
`;
const Name = styled.div`
  font-weight: 700;
  font-size: 15px;
`;
const Status = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// const HBtn = styled.button`
//   width: 40px;
//   height: 40px;
//   border-radius: 14px;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   color: ${({ theme }) => theme.colors.secondary};
//   background: ${({ theme }) => theme.colors.secondarySoft};
// `;

export const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-block: 12px;
  -webkit-overflow-scrolling: touch;
`;
const DateDiv = styled.div`
  text-align: center;
  margin: 14px 0;
`;
const DateChip = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const TypingRow = styled.div`
  display: flex;
  padding: 4px 16px 8px;
`;
const TypingBubble = styled.div`
  background: ${({ theme }) => theme.colors.bubbleIncoming};
  padding: 12px 16px;
  border-radius: 22px;
  border-bottom-left-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: 1rem;
`;
const bounce = keyframes`0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-4px);opacity:1}`;
const TDot = styled.span<{ $i: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7a7a7a;
  animation: ${bounce} 1.2s ease-in-out ${({ $i }) => $i * 0.15}s infinite;
`;

const UnreadBtn = styled(motion.button)`
  position: fixed;
  right: 10px;
  bottom: 20%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.secondary};
  color: "ffff";
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 8;
`;
