import type { EmojiClickData } from "emoji-picker-react";
import { motion } from "framer-motion";
import {
  CameraIcon,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Send,
  Smile,
  Square,
  XIcon,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { MessageType, SocketEvent } from "#/lib/constants";
import {
  useSendAudio,
  useSendFile,
  useSendImage,
  useSendVideo,
} from "#/hooks/mutations/useSendMessage";
import { queryClient } from "#/lib/query-client";
import { useWebSocketStore } from "#/store/websocket.store";
import { BottomSheet } from "./BottomSheet";
import { EmojiPickerComponent } from "./EmojiPicker";
import { Button } from "./Button";

type MessageForm = {
  message: string;
};

type MediaKind = "image" | "video" | "file";

type MediaDraft = {
  kind: MediaKind;
  file: File;
  url?: string;
  name: string;
  size: number;
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
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [mediaDraft, setMediaDraft] = useState<MediaDraft | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const discardVideoRef = useRef(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [messageType] = useState<MessageType>(MessageType.TEXT);
  // const newOrOldmessageId = conversationId ?? recipientId;

  const typing = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  //   const { profile } = useUserProfile();
  const sendAudioMutation = useSendAudio();
  const sendImageMutation = useSendImage();
  const sendVideoMutation = useSendVideo();
  const sendFileMutation = useSendFile();

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
      if (attachmentMenuRef.current?.contains(target)) return;
      if (attachmentButtonRef.current?.contains(target)) return;

      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
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

    sendAudioMutation.mutate(formData, {
      onSuccess: () => {
        resetAudio();
        scrollToBottom();
      },
    });
  };

  const handleStartVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoStreamRef.current = stream;

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (discardVideoRef.current) {
          discardVideoRef.current = false;
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        setVideoBlob(blob);
        setVideoUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setVideoDuration(0);
      setIsVideoRecording(true);
      (window as any).__chatVideoRecorder = recorder;
    } catch (error: any) {
      console.error(error);
      if (error?.message) {
        alert(error.message);
      }
    }
  };

  const handleStopVideoRecording = () => {
    const recorder = (window as any).__chatVideoRecorder as
      | MediaRecorder
      | undefined;
    if (!recorder) return;

    recorder.stop();
    setIsVideoRecording(false);
  };

  const resetVideoRecording = () => {
    const recorder = (window as any).__chatVideoRecorder as
      | MediaRecorder
      | undefined;
    if (recorder && recorder.state !== "inactive") {
      discardVideoRef.current = true;
      recorder.stop();
    }
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoBlob(null);
    setVideoDuration(0);
    setIsVideoRecording(false);
    delete (window as any).__chatVideoRecorder;
  };

  useEffect(() => {
    if (!isVideoRecording) return;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setVideoDuration(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [isVideoRecording]);

  useEffect(() => {
    if (videoPreviewRef.current && videoStreamRef.current) {
      videoPreviewRef.current.srcObject = videoStreamRef.current;
    }
  }, [isVideoRecording]);

  useEffect(() => {
    return () => {
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleSendVideoRecording = () => {
    if (!videoBlob) return;

    const formData = new FormData();
    formData.append("video", videoBlob);

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (recipientId) {
      formData.append("recipientId", recipientId);
    }
    formData.append("duration", String(videoDuration));

    sendVideoMutation.mutate(formData, {
      onSuccess: () => {
        resetVideoRecording();
        scrollToBottom();
      },
    });
  };

  const handleVideoAction = () => {
    if (isVideoRecording) {
      handleStopVideoRecording();
      return;
    }

    if (videoUrl) {
      handleSendVideoRecording();
      return;
    }

    handleStartVideoRecording();
  };

  const clearMediaDraft = () => {
    if (mediaDraft?.url) {
      URL.revokeObjectURL(mediaDraft.url);
    }
    setMediaDraft(null);
  };

  const handleMediaSelection = (kind: MediaKind) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const url =
        file.type.startsWith("image/") || file.type.startsWith("video/")
          ? URL.createObjectURL(file)
          : undefined;

      setMediaDraft({
        kind,
        file,
        url,
        name: file.name || `${kind}.${file.type.split("/")[1] || "bin"}`,
        size: file.size,
      });

      event.target.value = "";
    };
  };

  const handleSendMedia = () => {
    if (!mediaDraft) return;

    const formData = new FormData();
    formData.append(mediaDraft.kind, mediaDraft.file);

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (recipientId) {
      formData.append("recipientId", recipientId);
    }

    console.log(mediaDraft.kind, mediaDraft.file);

    const mediaMutation =
      mediaDraft.kind === "image"
        ? sendImageMutation
        : mediaDraft.kind === "video"
          ? sendVideoMutation
          : sendFileMutation;

    mediaMutation.mutate(formData, {
      onSuccess: () => {
        clearMediaDraft();
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

        <ComposerWrap>
          <MenuButton
            ref={attachmentButtonRef}
            type="button"
            aria-label="More actions"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
          >
            <Paperclip size={16} />
          </MenuButton>

          <TextWrap>
            <EmojiButton
              ref={emojiButtonRef}
              type="button"
              aria-label="Emoji"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <Smile size={18} />
            </EmojiButton>

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
          </TextWrap>

          <RecorderCluster>
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
                <Send size={18} />
              </SendBtn>
            ) : (
              <>
                <CircleRecordBtn
                  type="button"
                  aria-label="Record video"
                  $active={isVideoRecording}
                  onClick={handleVideoAction}
                >
                  <CameraIcon size={18} />
                </CircleRecordBtn>

                <CircleRecordBtn
                  type="button"
                  aria-label="Record audio"
                  $active={isRecording}
                  onClick={() => startRecording()}
                >
                  <Mic size={18} />
                </CircleRecordBtn>
              </>
            )}
          </RecorderCluster>
        </ComposerWrap>

        {showAttachmentMenu && (
          <AttachmentMenu ref={attachmentMenuRef}>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                fileInputRef.current?.click();
              }}
            >
              <AttachmentIcon $tone="#3b82f6">
                <FileText size={18} />
              </AttachmentIcon>
              <span>Document</span>
            </AttachmentItem>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                imageInputRef.current?.click();
              }}
            >
              <AttachmentIcon $tone="#10b981">
                <ImageIcon size={18} />
              </AttachmentIcon>
              <span>Photos &amp; videos</span>
            </AttachmentItem>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                videoInputRef.current?.click();
              }}
            >
              <AttachmentIcon $tone="#f59e0b">
                <CameraIcon size={18} />
              </AttachmentIcon>
              <span>Camera</span>
            </AttachmentItem>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                startRecording();
              }}
            >
              <AttachmentIcon $tone="#ef4444">
                <Mic size={18} />
              </AttachmentIcon>
              <span>Audio</span>
            </AttachmentItem>
            {/* <AttachmentItem onClick={() => setShowAttachmentMenu(false)}>
              <AttachmentIcon $tone="#60a5fa">
                <Paperclip size={18} />
              </AttachmentIcon>
              <span>Contact</span>
            </AttachmentItem>
            <AttachmentItem onClick={() => setShowAttachmentMenu(false)}>
              <AttachmentIcon $tone="#a78bfa">
                <BarChart3 size={18} />
              </AttachmentIcon>
              <span>Poll</span>
            </AttachmentItem>
            <AttachmentItem onClick={() => setShowAttachmentMenu(false)}>
              <AttachmentIcon $tone="#f97316">
                <CalendarDays size={18} />
              </AttachmentIcon>
              <span>Event</span>
            </AttachmentItem>
            <AttachmentItem onClick={() => setShowAttachmentMenu(false)}>
              <AttachmentIcon $tone="#14b8a6">
                <Sparkles size={18} />
              </AttachmentIcon>
              <span>New sticker</span>
            </AttachmentItem> */}
          </AttachmentMenu>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleMediaSelection("image")}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={handleMediaSelection("video")}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          hidden
          onChange={handleMediaSelection("file")}
        />
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

      {(isVideoRecording || videoUrl) && (
        <VideoRecorderScreen>
          <VideoRecorderTopbar>
            <VideoRecorderTitle>
              {isVideoRecording ? "Recording video" : "Preview video"}
            </VideoRecorderTitle>
            {isVideoRecording && <VideoTimer>{videoDuration}s</VideoTimer>}
          </VideoRecorderTopbar>

          <VideoPreview
            ref={videoPreviewRef}
            src={videoUrl ?? undefined}
            autoPlay={isVideoRecording}
            muted={isVideoRecording}
            controls={!isVideoRecording}
            playsInline
          />

          <VideoRecorderActions>
            <VideoCancelBtn onClick={resetVideoRecording}>
              Cancel
            </VideoCancelBtn>
            {isVideoRecording ? (
              <StopVideoBtn onClick={handleStopVideoRecording}>
                <Square size={16} fill="currentColor" />
                Stop recording
              </StopVideoBtn>
            ) : (
              <SendRecBtn
                onClick={handleSendVideoRecording}
                isLoading={sendVideoMutation.isPending}
              >
                <Send size={16} />
                Send video
              </SendRecBtn>
            )}
          </VideoRecorderActions>
        </VideoRecorderScreen>
      )}

      <BottomSheet open={!!mediaDraft} onClose={clearMediaDraft}>
        <RecBody>
          <RecHead>
            <RecTitle>
              {mediaDraft?.kind === "image" && "Send photo"}
              {mediaDraft?.kind === "video" && "Send video"}
              {mediaDraft?.kind === "file" && "Send file"}
            </RecTitle>
          </RecHead>

          {mediaDraft?.kind === "image" && mediaDraft.url && (
            <PreviewImage src={mediaDraft.url} alt={mediaDraft.name} />
          )}

          {mediaDraft?.kind === "video" && mediaDraft.url && (
            <PreviewVideo controls src={mediaDraft.url} />
          )}

          {mediaDraft?.kind === "file" && (
            <FilePreview>
              <FileText size={24} />
              <div>
                <FileName>{mediaDraft.name}</FileName>
                <FileMeta>
                  {Math.max(1, Math.ceil(mediaDraft.size / 1024))} KB
                </FileMeta>
              </div>
            </FilePreview>
          )}

          <RecActions>
            <CancelBtn onClick={clearMediaDraft}>
              <XIcon
                size={16}
                style={{ marginRight: 6, verticalAlign: "middle" }}
              />
              Cancel
            </CancelBtn>

            <SendRecBtn
              onClick={() => handleSendMedia()}
              isLoading={
                mediaDraft?.kind === "image"
                  ? sendImageMutation.isPending
                  : mediaDraft?.kind === "video"
                    ? sendVideoMutation.isPending
                    : sendFileMutation.isPending
              }
            >
              <Send size={16} />
              Send {mediaDraft?.kind === "file" ? "file" : mediaDraft?.kind}
            </SendRecBtn>
          </RecActions>
        </RecBody>
      </BottomSheet>
    </>
  );
}

const Composer = styled.form`
  flex-shrink: 0;
  padding: 10px 12px calc(18px + env(safe-area-inset-bottom));
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
`;

const VideoRecorderScreen = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #080808;
  color: #fff;
`;

const VideoRecorderTopbar = styled.div`
  position: absolute;
  top: max(18px, env(safe-area-inset-top));
  left: 18px;
  right: 18px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const VideoRecorderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const VideoTimer = styled.div`
  color: #ff4000;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

const VideoPreview = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #141414;
`;

const VideoRecorderActions = styled.div`
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 1;
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const StopVideoBtn = styled.button`
  flex: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 18px;
  background: #ff4000;
  color: #fff;
  font-weight: 700;
`;

const ComposerWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 32px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 8px 10px 8px 8px;
  min-height: 54px;
`;

const MenuButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  flex-shrink: 0;
`;

const EmojiButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.background};
  flex-shrink: 0;
`;

const RecorderCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 4px;
`;

const CircleRecordBtn = styled.button<{ $active?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active, theme }) =>
    $active ? "#ff4000" : theme.colors.textPrimary};
  background: ${({ $active, theme }) =>
    $active ? "rgba(255, 64, 0, 0.12)" : theme.colors.background};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? "rgba(255, 64, 0, 0.2)" : theme.colors.border};
  flex-shrink: 0;
`;

const SendBtn = styled(motion.button)`
  width: 38px;
  height: 38px;
  border-radius: 50%;
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
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  font-size: 15px;
  padding: 10px 4px;
  max-height: 110px;
  min-height: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder {
    color: rgba(255, 255, 255, 0.54);
  }
`;

const AttachmentMenu = styled.div`
  position: absolute;
  left: 8px;
  bottom: calc(100% + 10px);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: min(240px, 72vw);
  padding: 8px;
`;

const AttachmentItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const AttachmentIcon = styled.span<{ $tone: string }>`
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $tone }) => `${$tone}22`};
  color: ${({ $tone }) => $tone};
  flex-shrink: 0;
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

const PreviewImage = styled.img`
  width: 100%;
  max-height: 220px;
  border-radius: 18px;
  object-fit: cover;
`;

const PreviewVideo = styled.video`
  width: 100%;
  max-height: 220px;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.background};
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const FileName = styled.div`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
`;

const FileMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
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

const VideoCancelBtn = styled(CancelBtn)`
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
`;
