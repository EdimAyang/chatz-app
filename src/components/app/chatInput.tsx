import type { EmojiClickData } from "emoji-picker-react";
import { motion } from "framer-motion";
import { Mic, Send, Smile, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { MessageType, SocketEvent } from "#/lib/constants";
// import type { ClientMessagePayload } from "#/schema/websocket.schema";
import { useSendAudio } from "#/hooks/mutations/useSendMessage";
import { queryClient } from "#/lib/query-client";
import { useWebSocketStore } from "#/store/websocket.store";
// import { useUserProfile } from "@/store/auth.store";
import { BottomSheet } from "./BottomSheet";
import { EmojiPickerComponent } from "./EmojiPicker";
import { Button } from "./Button";
// import { useChatStore } from "#/store/chat.store";

type MessageForm = {
  message: string;
};

type ChatInputProps = {
  conversationId: string;
  startRecording: () => Promise<void>;
  isRecording: boolean;
  audioUrl: string | null;
  duration: number;
  resetAudio: () => void;
  audioBlob: Blob | null;
  stopRecording: () => void;
  recipientId: string;
  scrollToBottom: () => void;
  isAtBottom: boolean;
};

export default function ChatInput({
  conversationId,
  stopRecording,
  startRecording,
  isRecording,
  audioUrl,
  duration,
  resetAudio,
  audioBlob,
  recipientId,
  scrollToBottom,
  isAtBottom,
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [messageType] = useState<MessageType>(MessageType.TEXT);
  const newOrOldmessageId = conversationId ?? recipientId;

  const typing = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  //   const { profile } = useUserProfile();
  const sendAudioMutation = useSendAudio();

  const { send } = useWebSocketStore();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<MessageForm>({
      defaultValues: {
        message: "",
      },
    });

  useEffect(() => {
    const closePicker = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (pickerRef.current?.contains(target)) return;
      if (emojiButtonRef.current?.contains(target)) return;

      setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", closePicker);
    document.addEventListener("touchstart", closePicker);

    return () => {
      document.removeEventListener("mousedown", closePicker);
      document.removeEventListener("touchstart", closePicker);
    };
  }, []);

  const message = watch("message");
  //   const userId = profile?.data.id as string;

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const onSubmit = ({ message }: MessageForm) => {
    // scrollToBottom();
    if (!message.trim()) return;
    if (recipientId) {
      queryClient.invalidateQueries({ queryKey: ["messages", recipientId] });
    }

    switch (messageType) {
      case MessageType.TEXT:
        send({
          type: SocketEvent.NEW_MESSAGE,
          conversationId,
          messageType: MessageType.TEXT,
          message,
          isRead: false,
          recipientId,
        });
        scrollToBottom();
        break;

      case MessageType.IMAGE:
        // await uploadImage(file); // HTTP endpoint
        break;

      default:
        console.warn("Unsupported message type");
        return;
    }
    stopTyping();
    reset();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue("message", message + emojiData.emoji, { shouldDirty: true });
  };

  const stopTyping = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    if (!typing.current) return;

    send({
      type: SocketEvent.STOP_TYPING,
      conversationId,
      ...(recipientId && { recipientId }),
      isTyping: false,
    });

    typing.current = false;
  };

  const handleTyping = (value: string) => {
    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!typing.current) {
      send({
        type: SocketEvent.TYPING,
        conversationId,
        ...(recipientId && { recipientId }),
        isTyping: true,
      });

      typing.current = true;
    }

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSendAudio = () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("audio", audioBlob);

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (recipientId) {
      formData.append("recipientId", recipientId);
    }
    if (duration) {
      formData.append("duration", String(duration));
    }

    // console.log(formData);
    sendAudioMutation.mutate(formData, {
      onSuccess: () => {
        resetAudio();
        queryClient.invalidateQueries({
          queryKey: ["messages", newOrOldmessageId],
        });
        scrollToBottom();
      },
    });
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [message]);

  return (
    <>
      <Composer onSubmit={handleSubmit(onSubmit)}>
        {showEmojiPicker && (
          <EmojiPickerComponent
            handleEmojiClick={handleEmojiClick}
            pickerRef={pickerRef}
          />
        )}

        <CBtn ref={emojiButtonRef} type="button" aria-label="Emoji">
          <Smile
            size={22}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
        </CBtn>
        <TextWrap>
          <TextArea
            placeholder="Message"
            rows={1}
            {...register("message")}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 110)}px`;
              handleTyping(t.value);
            }}
          />
          {/* <CBtn type="button" aria-label="Attach">
            <Paperclip size={20} />
          </CBtn>
          <CBtn type="button" aria-label="Camera">
            <Camera size={20} />
          </CBtn> */}
        </TextWrap>
        {message.trim() ? (
          <SendBtn
            type="submit"
            whileTap={{ scale: 0.92 }}
            aria-label="Send"
            onClick={() => {
              if (isAtBottom) {
                scrollToBottom();
              }
            }}
          >
            <Send size={20} />
          </SendBtn>
        ) : (
          <SendBtn type="button" whileTap={{ scale: 0.92 }} aria-label="Record">
            <Mic size={20} onClick={() => startRecording()} />
          </SendBtn>
        )}
      </Composer>

      <BottomSheet
        open={isRecording || !!audioUrl}
        onClose={() => resetAudio()}
      >
        <RecBody>
          <RecHead>
            <RecTitle>
              {isRecording ? "Recording..." : "Recording complete"}
            </RecTitle>

            <Timer>
              {Math.floor(duration / 60)}:
              {String(duration % 60).padStart(2, "0")}
            </Timer>
          </RecHead>

          {/* Show preview after recording */}
          {audioUrl && (
            <audio
              controls
              src={audioUrl}
              style={{ width: "100%", marginTop: 16 }}
            >
              <track kind="captions" />
            </audio>
          )}

          <RecActions>
            {!isRecording && (
              <CancelBtn onClick={() => resetAudio()}>
                <XIcon
                  size={16}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Cancel
              </CancelBtn>
            )}

            {isRecording ? (
              <SendRecBtn onClick={() => stopRecording()}>
                Stop Recording
              </SendRecBtn>
            ) : (
              <SendRecBtn
                onClick={() => handleSendAudio()}
                isLoading={sendAudioMutation.isPending}
              >
                <Send size={16} />
                Send Recording
              </SendRecBtn>
            )}
          </RecActions>
        </RecBody>
      </BottomSheet>
    </>
  );
}

const Composer = styled.form`
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: saturate(180%) blur(20px);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 5px calc(20px + env(safe-area-inset-bottom));
  width: 100%;
`;
const CBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;
const SendBtn = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.orange};
  flex-shrink: 0;
`;
const TextWrap = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 22px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;
const TextArea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  font-size: 16px;
  padding: 8px 4px;
  max-height: 110px;
  min-height: 24px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const RecBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const RecHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const RecTitle = styled.div`
  font-weight: 700;
  font-size: 17px;
`;
const Timer = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 700;
`;
const RecActions = styled.div`
  display: flex;
  gap: 12px;
`;
const CancelBtn = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.background};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const SendRecBtn = styled(Button)`
  flex: 2;
  padding: 14px;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
