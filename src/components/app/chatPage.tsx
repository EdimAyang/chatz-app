import {
  ArrowLeft,
  Camera,
  ChevronDown,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import React, {
  Fragment,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import toast from "react-hot-toast";
import { Avatar } from "@/components/app/Avatar";
// import { MobileFrame } from "@/components/app/MobileFrame";
import { useAudioRecorder } from "#/hooks/useAudioRecorder";
import ChatInput from "@/components/app/chatInput";
import { useGetMessageQuery } from "@/hooks/queries/useGetMessage";
import { useUserProfile } from "@/store/auth.store";
import {
  useWebSocketStore,
  // type CachedMessages,
} from "@/store/websocket.store";
import {
  formatMessageDate,
  formatRecentDate,
} from "@/utils/dates";
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
  LoadingOlder,
  MessageListSkeleton,
} from "#/components/app/Loader";
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll";
// import type { MessageRendererProps } from "./messageRenderer";
import type { ChatMessage, MessageStatus } from "#/types";
// import { addPendingAction } from "#/lib/offline/messageQueue";
// import { queryClient } from "#/lib/query-client";
import { useCallStore } from "@/store/call.store";
import { closeWebRTC, toggleCamera, toggleMicrophone } from "@/webRTC";
import { queryClient } from "#/lib/query-client";

type ChatPageProps = {
  conversationId?: string;
  recipientId?: string;
};

const chatPage = ({ conversationId, recipientId }: ChatPageProps) => {
  const { profile } = useUserProfile();
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null,
  );
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const callStatus = useCallStore((state) => state.status);

  const startOutgoingCall = useCallStore((state) => state.startOutgoingCall);

  const resetCall = useCallStore((state) => state.resetCall);
  const connectWebSocket = useWebSocketStore((state) => state.connect);
  const callStartInProgressRef = useRef(false);

  const [deleteMessage, setDeleteMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    void queryClient.invalidateQueries({
      queryKey: ["messages", conversationId],
    });
  }, [conversationId]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetMessageQuery(conversationId ?? "", "100");

  const { data: userData, isLoading: isUserLoading } = useGetUserQuery(
    recipientId ?? "",
  );

  const createdConversationId = useWebSocketStore(
    (state) => state.createdConversationId,
  );
  const setCreatedConversationId = useWebSocketStore(
    (state) => state.setCreatedConversationId,
  );

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mediaQuery.matches);

    updateMobile();
    mediaQuery.addEventListener("change", updateMobile);
    return () => mediaQuery.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const viewport = window.visualViewport;
    const updateViewportInsets = () => {
      const top = viewport?.offsetTop ?? 0;
      const bottom = viewport
        ? Math.max(0, window.innerHeight - viewport.height - top)
        : 0;

      document.documentElement.style.setProperty(
        "--chat-visual-viewport-top",
        `${top}px`,
      );
      document.documentElement.style.setProperty(
        "--chat-visual-viewport-bottom",
        `${bottom}px`,
      );
    };

    updateViewportInsets();
    viewport?.addEventListener("resize", updateViewportInsets);
    viewport?.addEventListener("scroll", updateViewportInsets);
    window.addEventListener("resize", updateViewportInsets);

    return () => {
      viewport?.removeEventListener("resize", updateViewportInsets);
      viewport?.removeEventListener("scroll", updateViewportInsets);
      window.removeEventListener("resize", updateViewportInsets);
      document.documentElement.style.removeProperty(
        "--chat-visual-viewport-top",
      );
      document.documentElement.style.removeProperty(
        "--chat-visual-viewport-bottom",
      );
    };
  }, [isMobile]);

  useEffect(() => {
    if (!createdConversationId) return;

    navigate(PATHS.CHAT.CHAT(createdConversationId));

    setCreatedConversationId(null);
  }, [createdConversationId, navigate, setCreatedConversationId]);

  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const firstPage = data?.pages?.[0];

  const {
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    audioBlob,
    audioUrl,
    duration,
    waveformLevels,
    resetAudio,
  } = useAudioRecorder();

  const { typingKey, typingUserId, send, isConnected, isConnecting } =
    useWebSocketStore();

  const connectionIsHealthy = isNetworkOnline && isConnected;
  const connectionLabel = !isNetworkOnline
    ? "Offline"
    : isConnecting
      ? "Reconnecting"
      : isConnected
        ? "Connected"
        : "Offline";

  const isTyping =
    typingKey === conversationId && typingUserId !== profile?.data.id;

  //     console.log(
  //   "PAGE ORDER",
  //   data?.pages.map((page, index) => ({
  //     page: index,
  //     first: page.messages[0]?.createdAt,
  //     last: page.messages[page.messages.length - 1]?.createdAt,
  //   })),
  // );

  const ourMessages = useMemo(() => {
    return (
      data?.pages
        .slice()
        .reverse()
        .flatMap((page) =>
          page.messages.map((message) => ({
            ...message,
            status: message.status ?? ("sent" as MessageStatus),
          })),
        ) ?? []
    );
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

  const {
    isAtBottom,
    scrollToBottom,
    handleScroll: handleBottomScroll,
    bottomRef,
    containerRef,
    scrollToBottomInstant,
  } = useNewMsgTrigger();

  const RecipientAvatar = firstPage?.recipient?.user?.avatarUrl ?? "";
  const RecipientId = firstPage?.recipient?.user?.id ?? "";
  const RecipientName = firstPage?.recipient?.user?.username ?? "";
  const RecipientLastSeen = firstPage?.recipient?.user?.lastSeen ?? "";
  const RecipientIsOnline = firstPage?.recipient?.user?.isOnline ?? false;

  useLayoutEffect(() => {
    scrollToBottomInstant();
  }, [conversationId]);

  useEffect(() => {
    if (isAtBottom && isTyping) {
      scrollToBottomInstant();
    }
  }, [ourMessages, isTyping, isAtBottom]);

  const handleInfiniteScroll = useInfiniteScroll({
    direction: "top",
    threshold: 120,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const handleCombinedScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      handleBottomScroll();
      handleInfiniteScroll(event);
    },
    [handleBottomScroll, handleInfiniteScroll],
  );

  const handleBack = () => {
    if (!conversationId) return;
    navigate(PATHS.CHAT.HOME);
  };

  const handleStartCall = async (type: "audio" | "video") => {
    if (!conversationId || !RecipientId) {
      console.error("A conversation and recipient are required to call.");
      return;
    }

    if (callStatus !== "idle" || callStartInProgressRef.current) {
      console.error("A call is already in progress.");
      return;
    }

    callStartInProgressRef.current = true;

    try {
      if (!useWebSocketStore.getState().isConnected) {
        connectWebSocket();

        const connected = await new Promise<boolean>((resolve) => {
          let settled = false;
          let unsubscribe = () => {};
          const timeout = window.setTimeout(() => finish(false), 5000);

          const finish = (result: boolean) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            unsubscribe();
            resolve(result);
          };

          unsubscribe = useWebSocketStore.subscribe((state) => {
            if (state.isConnected) finish(true);
          });

          if (useWebSocketStore.getState().isConnected) {
            finish(true);
          }
        });

        if (!connected) {
          toast.error("Could not connect to start the call. Please try again.");
          return;
        }
      }

      startOutgoingCall({
        conversationId,
        recipientId: RecipientId,
        callType: type,
      });

      const sent = useWebSocketStore.getState().send({
        type: "CALL_USER",
        recipientId: RecipientId,
        conversationId,
        callType: type === "video" ? "VIDEO" : "VOICE",
      });

      if (!sent) {
        resetCall();
        toast.error("Could not start the call. Please try again.");
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Could not start the call. Please try again.");
    } finally {
      callStartInProgressRef.current = false;
    }
  };

  const header = userData ? (
    <Header>
      <Back onClick={() => handleBack()} aria-label="Back">
        <ArrowLeft size={20} />
      </Back>
      <Avatar
        src={userData.data.avatar || ""}
        size={40}
        online={userData.data.isOnline}
        userId={userData.data.id}
      />
      <Who>
        <Name>{userData.data.username || ""}</Name>
        <Status>
          {userData.data.isOnline
            ? "online now"
            : formatRecentDate(userData.data.lastSeen || "")}
        </Status>
      </Who>

      <CallActions>
        <HeaderCallButton
          type="button"
          aria-label="Start voice call"
          title="Voice call"
          onClick={() => handleStartCall("audio")}
        >
          <Phone size={18} />
        </HeaderCallButton>
        <HeaderCallButton
          type="button"
          aria-label="Start video call"
          title="Video call"
          onClick={() => handleStartCall("video")}
        >
          <Video size={19} />
        </HeaderCallButton>
      </CallActions>
      <ConnectionBadge $connected={connectionIsHealthy}>
        <Wifi size={15} />
        <span>{connectionLabel}</span>
      </ConnectionBadge>
    </Header>
  ) : (
    <Header>
      <Back onClick={() => handleBack()} aria-label="Back">
        <ArrowLeft size={20} />
      </Back>
      <Avatar
        src={RecipientAvatar}
        size={40}
        online={RecipientIsOnline}
        userId={firstPage?.recipient?.user?.id}
      />
      <Who>
        <Name>{RecipientName}</Name>
        <Status>
          {RecipientIsOnline
            ? "online now"
            : formatRecentDate(RecipientLastSeen || "")}
        </Status>
      </Who>
      <CallActions>
        <HeaderCallButton
          type="button"
          aria-label="Start voice call"
          title="Voice call"
          onClick={() => handleStartCall("audio")}
        >
          <Phone size={18} />
        </HeaderCallButton>
        <HeaderCallButton
          type="button"
          aria-label="Start video call"
          title="Video call"
          onClick={() => handleStartCall("video")}
        >
          <Video size={19} />
        </HeaderCallButton>
      </CallActions>
      <ConnectionBadge $connected={connectionIsHealthy}>
        <Wifi size={15} />
        <span>{connectionLabel}</span>
      </ConnectionBadge>
    </Header>
  );

  const chatInput = (
    <ChatInput
      conversationId={conversationId ?? ""}
      startRecording={startRecording}
      isRecording={isRecording}
      isPaused={isPaused}
      audioUrl={audioUrl}
      duration={duration}
      waveformLevels={waveformLevels}
      pauseRecording={pauseRecording}
      resumeRecording={resumeRecording}
      resetAudio={resetAudio}
      audioBlob={audioBlob}
      stopRecording={stopRecording}
      recipientId={recipientId ?? ""}
      scrollToBottom={scrollToBottom}
      isAtBottom={isAtBottom}
      editingMessage={editingMessage!}
      setEditingMessage={setEditingMessage!}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      deleteMessage={deleteMessage}
      setDeleteMessage={setDeleteMessage}
    />
  );

  return (
    <ChatLayout>
      {isUserLoading || isLoading ? (
        <>
          <ChatHeaderSkeleton />
          <MessageListSkeleton />
        </>
      ) : (
        <>
          {isMobile ? createPortal(header, document.body) : header}
          {isMobile && <HeaderSpace aria-hidden="true" />}
          {ourMessages.length > 0 && (
            <Scroll ref={containerRef} onScroll={handleCombinedScroll}>
              <AnimatePresence>
                {isFetchingNextPage && <LoadingOlder />}
              </AnimatePresence>
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
                      status={m.status}
                      message={m}
                      mine={m.senderId === profile?.data.id}
                      onEdit={(message) => {
                        if (!message.id) {
                          return;
                        }
                        setEditingMessage(message);
                        setReplyingTo(null);
                      }}
                      onReply={(message) => {
                        if (!message.id) {
                          return;
                        }
                        setReplyingTo(message);
                        setEditingMessage(null);
                      }}
                      onDelete={(message) => {
                        if (!message.id) {
                          return;
                        }
                        setDeleteMessage(message);
                        setEditingMessage(null);
                        setReplyingTo(null);
                      }}
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

      {isMobile ? createPortal(chatInput, document.body) : chatInput}
    </ChatLayout>
  );
};
export default chatPage;

export function GlobalCallOverlay() {
  const callId = useCallStore((state) => state.callId);
  const conversationId = useCallStore((state) => state.conversationId);
  const callType = useCallStore((state) => state.callType);
  const callStatus = useCallStore((state) => state.status);
  const callError = useCallStore((state) => state.error);
  const callerId = useCallStore((state) => state.callerId);
  const recipientId = useCallStore((state) => state.recipientId);
  const localStream = useCallStore((state) => state.localStream);
  const setStatus = useCallStore((state) => state.setStatus);
  const resetCall = useCallStore((state) => state.resetCall);
  const send = useWebSocketStore((state) => state.send);
  const navigate = useNavigate();
  const contactId = recipientId ?? callerId;
  const { data: contactData } = useGetUserQuery(contactId ?? "");

  useEffect(() => {
    if (callStatus !== "error") return;

    toast.error(callError || "The call could not be completed.");
    closeWebRTC();
    resetCall();
  }, [callError, callStatus, resetCall]);

  useEffect(() => {
    if (callStatus !== "ended") return;

    const resetTimer = window.setTimeout(() => {
      if (conversationId) {
        navigate(PATHS.CHAT.CHAT(conversationId));
      }
      resetCall();
    }, 5000);

    return () => window.clearTimeout(resetTimer);
  }, [callStatus, conversationId, navigate, resetCall]);

  const handleAcceptCall = () => {
    if (!callId) {
      console.error("Cannot accept the call: call ID is missing.");
      return;
    }

    const sent = send({
      type: "ACCEPT_CALL",
      callId,
      conversationId,
    });

    if (sent) {
      setStatus("connecting");
    }
  };

  const handleRejectCall = () => {
    if (callId) {
      send({
        type: "REJECT_CALL",
        callId,
        conversationId,
      });
    }

    closeWebRTC();
    setStatus("ended");
  };

  const handleEndCall = () => {
    if (callId && callStatus !== "ended") {
      const sent = send({
        type: "END_CALL",
        callId,
        conversationId,
      });

      if (!sent) {
        console.error(
          "Failed to notify the other participant that the call ended.",
        );
      }
    }

    closeWebRTC();
    setStatus("ended");
  };

  if (callStatus === "idle" || !callType) return null;

  return createPortal(
    <CallScreen
      type={callType}
      name={contactData?.data.username || "Contact"}
      avatar={contactData?.data.avatar || ""}
      status={callStatus}
      onAccept={handleAcceptCall}
      onReject={handleRejectCall}
      onEnd={handleEndCall}
      localStream={localStream}
    />,
    document.body,
  );
}

function CallScreen({
  type,
  name,
  avatar,
  status,
  onAccept,
  onReject,
  onEnd,
  localStream,
}: {
  type: "audio" | "video";
  name: string;
  avatar: string;
  localStream: MediaStream | null;
  status:
    | "calling"
    | "ringing"
    | "connecting"
    | "connected"
    | "ended"
    | "error";
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remoteStream = useCallStore((state) => state.remoteStream);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [microphoneMuted, setMicrophoneMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const remoteSpeakingRef = useRef(false);
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const isVideoCall = type === "video";
  const hasLocalVideo = Boolean(
    cameraEnabled &&
    localStream
      ?.getVideoTracks()
      .some((track) => track.readyState === "live" && track.enabled),
  );

  useEffect(() => {
    const video = localVideoRef.current;

    if (!video) return;

    video.srcObject = localStream;
    return () => {
      video.srcObject = null;
    };
  }, [localStream]);

  useEffect(() => {
    const video = remoteVideoRef.current;

    if (!video) return;

    video.srcObject = remoteStream;
    setRemoteVideoReady(false);

    if (remoteStream) {
      void video.play().catch((error: unknown) => {
        console.error("Remote video playback failed:", error);
      });
    }

    return () => {
      video.srcObject = null;
      setRemoteVideoReady(false);
    };
  }, [remoteStream]);

  useEffect(() => {
    const audio = remoteAudioRef.current;

    if (!audio) return;

    audio.srcObject = isVideoCall ? null : remoteStream;

    if (!isVideoCall && remoteStream) {
      void audio.play().catch((error) => {
        console.error("Remote audio playback failed:", error);
      });
    }

    return () => {
      audio.srcObject = null;
    };
  }, [isVideoCall, remoteStream]);

  useEffect(() => {
    toggleMicrophone(!microphoneMuted);
  }, [microphoneMuted, localStream]);

  useEffect(() => {
    toggleCamera(cameraEnabled);
  }, [cameraEnabled, localStream]);

  useEffect(() => {
    const audio = remoteAudioRef.current;
    const video = remoteVideoRef.current;

    if (audio) audio.muted = !speakerEnabled;
    if (video) video.muted = !speakerEnabled;
  }, [speakerEnabled]);

  useEffect(() => {
    if (isVideoCall || !remoteStream?.getAudioTracks().length) {
      remoteSpeakingRef.current = false;
      setRemoteSpeaking(false);
      return;
    }

    if (typeof window.AudioContext === "undefined") {
      return;
    }

    let audioContext: AudioContext;
    let animationFrame = 0;
    let source: MediaStreamAudioSourceNode;
    let silentGain: GainNode;

    try {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source = audioContext.createMediaStreamSource(remoteStream);
      source.connect(analyser);
      silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      analyser.connect(silentGain);
      silentGain.connect(audioContext.destination);

      const samples = new Uint8Array(analyser.fftSize);
      const measureSpeech = () => {
        analyser.getByteTimeDomainData(samples);
        let total = 0;

        for (const sample of samples) {
          const amplitude = (sample - 128) / 128;
          total += amplitude * amplitude;
        }

        const isSpeaking = Math.sqrt(total / samples.length) > 0.035;
        if (remoteSpeakingRef.current !== isSpeaking) {
          remoteSpeakingRef.current = isSpeaking;
          setRemoteSpeaking(isSpeaking);
        }

        animationFrame = window.requestAnimationFrame(measureSpeech);
      };

      void audioContext.resume().catch((error: unknown) => {
        console.error("Could not start call audio analysis:", error);
      });
      animationFrame = window.requestAnimationFrame(measureSpeech);
    } catch (error) {
      console.error("Could not analyze remote call audio:", error);
      return;
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      source.disconnect();
      silentGain.disconnect();
      void audioContext.close().catch((error: unknown) => {
        console.error("Could not close call audio analysis:", error);
      });
      remoteSpeakingRef.current = false;
      setRemoteSpeaking(false);
    };
  }, [isVideoCall, remoteStream]);

  const contactAvatar = avatar ? (
    <CallAvatar src={avatar} alt="" $speaking={remoteSpeaking} />
  ) : (
    <CallAvatarFallback aria-hidden="true" $speaking={remoteSpeaking}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </CallAvatarFallback>
  );

  return (
    <CallOverlay
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideoCall ? "Video" : "Voice"} call with ${name}`}
      $video={isVideoCall}
    >
      <CallTopbar>
        <CallTopButton type="button" aria-label="End call" onClick={onEnd}>
          <PhoneOff size={20} />
        </CallTopButton>
        <CallTopTitle>{isVideoCall ? "Video call" : "Voice call"}</CallTopTitle>
        <CallTopButton type="button" aria-label="More call options" disabled>
          <MoreVertical size={22} />
        </CallTopButton>
      </CallTopbar>

      {isVideoCall ? (
        <VideoCallStage>
          <RemoteVideo
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={!speakerEnabled}
            onLoadedData={() => setRemoteVideoReady(true)}
            onEmptied={() => setRemoteVideoReady(false)}
          />
          {!remoteVideoReady && (
            <RemoteVideoPlaceholder>
              {contactAvatar}
              <VideoContactName>{name}</VideoContactName>
              <CallStatus>
                {status === "calling" && "Calling..."}
                {status === "ringing" && "Incoming call"}
                {status === "connecting" && "Connecting..."}
                {status === "connected" && "Waiting for video..."}
                {status === "ended" && "Call ended"}
                {status === "error" && "Call failed"}
              </CallStatus>
            </RemoteVideoPlaceholder>
          )}
          <LocalVideoTile>
            <LocalVideo ref={localVideoRef} autoPlay muted playsInline />
            {!hasLocalVideo && (
              <LocalVideoPlaceholder>
                <Camera size={20} />
                <span>Camera off</span>
              </LocalVideoPlaceholder>
            )}
            <LocalVideoLabel>You</LocalVideoLabel>
          </LocalVideoTile>
        </VideoCallStage>
      ) : (
        <AudioCallStage>
          <audio ref={remoteAudioRef} autoPlay muted={!speakerEnabled} />
          <AudioCallContact>
            {contactAvatar}

            <AudioContactName>{name}</AudioContactName>

            <CallStatus>
              {status === "calling" && "Calling..."}
              {status === "ringing" && "Incoming call"}
              {status === "connecting" && "Connecting..."}
              {status === "connected" && "Connected"}
              {status === "ended" && "Call ended"}
              {status === "error" && "Call failed"}
            </CallStatus>
          </AudioCallContact>
        </AudioCallStage>
      )}

      <CallControls>
        {status === "ringing" ? (
          <>
            <RejectCallButton
              type="button"
              aria-label="Reject call"
              onClick={onReject}
            >
              <PhoneOff size={23} />
            </RejectCallButton>
            <AcceptCallButton
              type="button"
              aria-label="Accept call"
              onClick={onAccept}
            >
              <Phone size={23} />
            </AcceptCallButton>
          </>
        ) : (
          <>
            <CallControl
              type="button"
              aria-label={
                speakerEnabled ? "Turn speaker off" : "Turn speaker on"
              }
              aria-pressed={speakerEnabled}
              onClick={() => setSpeakerEnabled((enabled) => !enabled)}
            >
              <CallControlIcon $active={speakerEnabled}>
                {speakerEnabled ? <Volume2 size={21} /> : <VolumeX size={21} />}
              </CallControlIcon>
              <CallControlLabel>
                {speakerEnabled ? "Speaker" : "Speaker off"}
              </CallControlLabel>
            </CallControl>

            <CallControl
              type="button"
              aria-label={
                microphoneMuted ? "Unmute microphone" : "Mute microphone"
              }
              aria-pressed={microphoneMuted}
              onClick={() => setMicrophoneMuted((muted) => !muted)}
            >
              <CallControlIcon $active={!microphoneMuted}>
                {microphoneMuted ? <MicOff size={21} /> : <Mic size={21} />}
              </CallControlIcon>
              <CallControlLabel>
                {microphoneMuted ? "Unmute" : "Mute"}
              </CallControlLabel>
            </CallControl>

            {isVideoCall && (
              <CallControl
                type="button"
                aria-label={
                  cameraEnabled ? "Turn camera off" : "Turn camera on"
                }
                aria-pressed={cameraEnabled}
                onClick={() => setCameraEnabled((enabled) => !enabled)}
              >
                <CallControlIcon $active={cameraEnabled}>
                  {cameraEnabled ? <Video size={21} /> : <VideoOff size={21} />}
                </CallControlIcon>
                <CallControlLabel>
                  {cameraEnabled ? "Camera" : "Camera off"}
                </CallControlLabel>
              </CallControl>
            )}

            <EndCallButton type="button" aria-label="End call" onClick={onEnd}>
              <PhoneOff size={23} />
            </EndCallButton>
          </>
        )}
      </CallControls>
    </CallOverlay>
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
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    z-index: 1;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 10;
  background: ${({ theme }) =>
    `color-mix(in srgb, ${theme.colors.background} 78%, transparent)`};
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    position: fixed;
    top: var(--chat-visual-viewport-top, 0px);
    left: 0;
    width: 100vw;
    z-index: 20;
  }
`;

const HeaderSpace = styled.div`
  height: 65px;
  flex-shrink: 0;
`;
const Back = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 700px) {
    display: none;
  }
`;
const Who = styled.div`
  flex: 1;
  min-width: 0;
`;

const CallActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const HeaderCallButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition:
    color 160ms ease,
    background 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.secondarySoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`;

export const ConnectionBadge = styled.div<{
  $connected: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 6px 8px;
  border-radius: 999px;
  color: ${({ $connected }) => ($connected ? "#16803c" : "#c53030")};
  background: ${({ $connected }) =>
    $connected ? "rgba(34, 197, 94, 0.14)" : "rgba(239, 68, 68, 0.14)"};
  font-size: 11px;
  font-weight: 700;

  @media (max-width: 420px) {
    span {
      display: none;
    }
  }
`;
const Name = styled.div`
  font-weight: 700;
  font-size: 15px;
`;
const Status = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CallOverlay = styled.div<{ $video: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  background: ${({ $video }) =>
    $video
      ? "radial-gradient(ellipse at 50% 43%, #25343a 0%, #10191d 52%, #080d10 100%)"
      : "radial-gradient(ellipse at 50% 35%, #28413f 0%, #142321 46%, #0c1514 100%)"};
  font-family: inherit;
`;

const CallTopbar = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: max(16px, env(safe-area-inset-top)) 18px 12px;
`;

const CallTopButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);

  &:disabled {
    cursor: default;
    opacity: 0.65;
  }
`;

const CallTopTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const AudioCallStage = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const AudioCallContact = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: -32px;
`;

const talkingPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(37, 211, 102, 0);
  }
  50% {
    transform: scale(1.035);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3), 0 0 0 12px rgba(37, 211, 102, 0.22);
  }
`;

const CallAvatar = styled.img<{ $speaking: boolean }>`
  width: 132px;
  height: 132px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  animation: ${talkingPulse} 1.15s ease-in-out infinite;
  animation-play-state: ${({ $speaking }) =>
    $speaking ? "running" : "paused"};
`;

const CallAvatarFallback = styled.div<{ $speaking: boolean }>`
  width: 132px;
  height: 132px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  font-size: 44px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  animation: ${talkingPulse} 1.15s ease-in-out infinite;
  animation-play-state: ${({ $speaking }) =>
    $speaking ? "running" : "paused"};
`;

const AudioContactName = styled.div`
  max-width: min(78vw, 420px);
  margin-top: 10px;
  overflow: hidden;
  font-size: 28px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CallStatus = styled.div`
  color: rgba(255, 255, 255, 0.68);
  font-size: 15px;
`;

const VideoContactName = styled.div`
  max-width: min(78vw, 420px);
  overflow: hidden;
  font-size: 25px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VideoCallStage = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin: 4px 14px 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: linear-gradient(
    155deg,
    rgba(57, 76, 78, 0.56),
    rgba(9, 15, 18, 0.5)
  );
`;

const RemoteVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #080d10;
`;

const RemoteVideoPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  background: radial-gradient(ellipse at 50% 40%, #25343a, #10191d 72%);
`;

const LocalVideoTile = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: clamp(104px, 24vw, 168px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 16px;
  background: #131a1d;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.36);
`;

const LocalVideo = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #131a1d;
`;

const LocalVideoPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
`;

const LocalVideoLabel = styled.span`
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  overflow: hidden;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.8);
`;

const CallControls = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(16px, 5vw, 30px);
  padding: 26px 20px max(30px, env(safe-area-inset-bottom));
`;

const CallControl = styled.button`
  display: flex;
  min-width: 54px;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  color: #fff;
  background: transparent;
  cursor: pointer;
`;

const CallControlIcon = styled.span<{ $active: boolean }>`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) =>
    $active ? "rgba(255, 255, 255, 0.24)" : "rgba(255, 255, 255, 0.12)"};
  transition: background 160ms ease;
`;

const CallControlLabel = styled.span`
  color: rgba(255, 255, 255, 0.86);
  font-size: 11px;
`;

const EndCallButton = styled.button`
  width: 58px;
  height: 58px;
  margin: -2px 0 0 4px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #e53935;
  box-shadow: 0 6px 20px rgba(229, 57, 53, 0.3);
  transform: rotate(135deg);
`;

const RejectCallButton = styled(EndCallButton)``;

const AcceptCallButton = styled(EndCallButton)`
  background: #25d366;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
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
  padding-inline: 12px;

  @media (max-width: 767px) {
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }
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
