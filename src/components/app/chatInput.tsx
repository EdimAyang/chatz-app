import type { EmojiClickData } from "emoji-picker-react";
import { motion } from "framer-motion";
import {
  CameraIcon,
  Check,
  CircleStop,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  Pause,
  Paperclip,
  Play,
  RefreshCw,
  Send,
  Smile,
  Trash2,
  Video,
  X,
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
import {
  useWebSocketStore,
  type CachedMessages,
} from "#/store/websocket.store";
import { BottomSheet } from "./BottomSheet";
import { EmojiPickerComponent } from "./EmojiPicker";
import { Button } from "./Button";
import type { ChatMessage } from "#/types";
import { useAuthStore } from "#/store/auth.store";
import type { ReplyToMessage } from "./MessageBubble";
import { addPendingAction } from "#/lib/offline/messageQueue";
import toast from "react-hot-toast";
// import { addOptimisticMediaMessage } from "#/utils/addPendingMedia";
import { checkMediaOnline } from "#/utils/checkMediaOnline";
import DeleteMessageDialog from "./DeleteDialogu";
// import { useSyncPendingMedia } from "#/hooks/useSyncPendingMedia";

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
  isPaused: boolean;
  audioUrl: string | null;
  duration: number;
  waveformLevels: number[];
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetAudio: () => void;
  audioBlob: Blob | null;
  stopRecording: () => Promise<Blob | null>;
  recipientId: string;
  scrollToBottom: () => void;
  isAtBottom: boolean;

  replyingTo: ChatMessage | null;

  setReplyingTo: React.Dispatch<React.SetStateAction<ChatMessage | null>>;

  editingMessage: ChatMessage | null;

  setEditingMessage: React.Dispatch<React.SetStateAction<ChatMessage | null>>;

  deleteMessage: ChatMessage | null;
  setDeleteMessage: React.Dispatch<React.SetStateAction<ChatMessage | null>>;

  // setDeleteMessage: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
};

export default function ChatInput({
  conversationId,
  stopRecording,
  startRecording,
  isRecording,
  isPaused,
  audioUrl,
  duration,
  waveformLevels,
  pauseRecording,
  resumeRecording,
  resetAudio,
  audioBlob,
  recipientId,
  scrollToBottom,
  isAtBottom,
  editingMessage,
  setEditingMessage,
  replyingTo,
  setReplyingTo,
  deleteMessage,
  setDeleteMessage,
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [mediaDraft, setMediaDraft] = useState<MediaDraft | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoPreviewPlaying, setIsVideoPreviewPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStopResolverRef = useRef<
    ((blob: Blob | null) => void) | null
  >(null);
  const discardVideoRef = useRef(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<boolean>(false)
  // const [messageType] = useState<MessageType>(MessageType.TEXT);

  // const newOrOldmessageId = conversationId ?? recipientId;

  const typing = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  //   const { profile } = useUserProfile();
  const sendAudioMutation = useSendAudio();
  const sendImageMutation = useSendImage();
  const sendVideoMutation = useSendVideo();
  const sendFileMutation = useSendFile();

  const { send } = useWebSocketStore();
  const { user } = useAuthStore();
  // const { syncPendingMedia } = useSyncPendingMedia();

  const refreshChatData = () => {
    void queryClient.invalidateQueries({ queryKey: ["messages"] });
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<MessageForm>({
      defaultValues: {
        message: "",
      },
    });

  useEffect(() => {
    if (editingMessage) {
      setValue("message", editingMessage.message);
    }
  }, [editingMessage, setValue]);

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

  const onSubmit = async ({ message }: MessageForm) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    // ========================================
    // EDIT
    // ========================================

    if (editingMessage) {
      if (!editingMessage.id) {
        return;
      }

      const clientActionId = crypto.randomUUID();
      const editedAt = new Date().toISOString();

      // ----------------------------------------
      // 1. OPTIMISTIC EDIT
      // ----------------------------------------

      queryClient.setQueryData<CachedMessages>(
        ["messages", conversationId],
        (old) => {
          if (!old?.pages?.length) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg.id === editingMessage.id
                  ? {
                      ...msg,
                      message: trimmedMessage,
                      editedAt,
                    }
                  : msg,
              ),
            })),
          };
        },
      );

      // ----------------------------------------
      // 2. SAVE EDIT TO OFFLINE OUTBOX
      // ----------------------------------------

      await addPendingAction({
        // id: crypto.randomUUID(),

        clientActionId,

        type: "EDIT_MESSAGE",

        conversationId,

        messageId: editingMessage.id,

        message: trimmedMessage,

        createdAt: editedAt,
      });

      // ----------------------------------------
      // 3. SEND IF ONLINE
      // ----------------------------------------

      const sent = send({
        type: SocketEvent.EDIT_MESSAGE,

        conversationId,

        messageId: editingMessage.id,

        message: trimmedMessage,

        clientActionId,
      });

      if (!sent) {
        console.log("📦 Edit saved to offline outbox");
      }

      // ----------------------------------------
      // 4. CLEAN UI
      // ----------------------------------------

      setEditingMessage(null);
      reset();
      stopTyping();

      return;
    }

    // ========================================
    // CREATE MESSAGE
    // ========================================

    const tempId = `temp-${crypto.randomUUID()}`;

    const clientActionId = crypto.randomUUID();

    const createdAt = new Date().toISOString();

    const replyToMessageId = replyingTo?.id ?? null;

    // ========================================
    // OPTIMISTIC MESSAGE
    // ========================================

    const optimisticMessage: ChatMessage = {
      clientMessageId: tempId,

      conversationId,

      senderId: user?.id as string,

      message: trimmedMessage,

      messageType: MessageType.TEXT,

      isRead: false,
      readAt: null,

      createdAt,
      updatedAt: null,

      isDeleted: false,
      deletedAt: null,
      editedAt: null,

      attachmentUrl: null,
      attachmentPublicId: null,
      mimeType: null,
      duration: null,

      replyToMessageId,

      replyTo: replyingTo ?? null,

      reactions: [],

      status: "sending",
    };

    // ========================================
    // 1. OPTIMISTIC CACHE UPDATE
    // ========================================

    queryClient.setQueryData<CachedMessages>(
      ["messages", conversationId],
      (old) => {
        // No existing cache
        if (!old?.pages?.length) {
          return {
            pages: [
              {
                messages: [optimisticMessage],
                nextCursor: null,
              },
            ],

            pageParams: [""],
          };
        }

        const pages = old.pages.map((page) => ({
          ...page,
          messages: [...page.messages],
        }));

        // Newest messages are in page 0
        pages[0] = {
          ...pages[0],
          messages: [...pages[0].messages, optimisticMessage],
        };

        return {
          ...old,
          pages,
        };
      },
    );

    // ========================================
    // 2. SAVE TO OFFLINE OUTBOX
    // ========================================

    await addPendingAction({
      clientActionId,

      type: "SEND_MESSAGE",

      conversationId,

      ...(recipientId && {
        recipientId,
      }),

      message: trimmedMessage,

      messageType: MessageType.TEXT,

      clientMessageId: tempId,

      replyToMessageId,

      createdAt,
    });

    // ========================================
    // 3. SEND IF ONLINE
    // ========================================

    const sent = send({
      type: SocketEvent.NEW_MESSAGE,

      conversationId,

      messageType: MessageType.TEXT,

      message: trimmedMessage,

      ...(recipientId && {
        recipientId,
      }),

      replyToMessageId,

      clientMessageId: tempId,
    });

    if (!sent) {
      console.log("📦 Message saved to offline outbox");
    }

    // ========================================
    // 4. CLEAN UI
    // ========================================

    scrollToBottom();

    setReplyingTo(null);

    reset();

    stopTyping();
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

  const handleSendAudio = async (recordedBlob?: Blob | null) => {
    if (!checkMediaOnline()) return;
    const blob = recordedBlob ?? audioBlob;
    if (!blob) return;

    // const clientMessageId = crypto.randomUUID();

    // ============================================
    // OPTIMISTIC MESSAGE — ONLINE + OFFLINE
    // ============================================

    // addOptimisticMediaMessage(queryClient, {
    //   clientMessageId,
    //   conversationId,
    //   senderId: user?.id as string,

    //   messageType: MessageType.AUDIO,

    //   file: audioBlob,
    //   fileName: `audio-${clientMessageId}.webm`,
    //   mimeType: audioBlob.type || "audio/webm",

    //   duration: duration ?? null,
    //   replyToMessageId: replyingTo?.id ?? null,
    // });

    // ============================================
    // OFFLINE
    // ============================================

    // if (!navigator.onLine) {
    //   await addPendingMessage({
    //     clientMessageId,
    //     conversationId,
    //     ...(recipientId && { recipientId }),

    //     message: null,
    //     messageType: MessageType.AUDIO,

    //     file: audioBlob,
    //     fileName: `audio-${clientMessageId}.webm`,
    //     mimeType: audioBlob.type || "audio/webm",

    //     duration: duration ?? null,
    //     replyToMessageId: replyingTo?.id ?? null,
    //     createdAt: new Date().toISOString(),
    //   });

    //   console.log("AUDIO SAVED OFFLINE:", clientMessageId);

    //   resetAudio();
    //   scrollToBottom();

    //   return;
    // }

    // ============================================
    // ONLINE
    // ============================================

    const formData = new FormData();
    formData.append("audio", blob);

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
          if (recorder.state === "paused") {
            const previewBlob = new Blob(chunks, {
              type: recorder.mimeType || "video/webm",
            });
            const previewUrl = URL.createObjectURL(previewBlob);
            setVideoUrl((currentUrl) => {
              if (currentUrl) URL.revokeObjectURL(currentUrl);
              return previewUrl;
            });
            setVideoBlob(previewBlob);
          }
        }
      };

      recorder.onstop = () => {
        if (discardVideoRef.current) {
          discardVideoRef.current = false;
          stream.getTracks().forEach((track) => track.stop());
          videoStopResolverRef.current?.(null);
          videoStopResolverRef.current = null;
          return;
        }

        const blob = new Blob(chunks, {
          type: recorder.mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);

        setVideoBlob(blob);
        setVideoUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl);
          return url;
        });
        setIsVideoRecording(false);
        setIsVideoPaused(false);
        stream.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
        videoStopResolverRef.current?.(blob);
        videoStopResolverRef.current = null;
      };

      recorder.start(250);
      setVideoDuration(0);
      setVideoUrl(null);
      setVideoBlob(null);
      setIsVideoRecording(true);
      setIsVideoPaused(false);
      videoRecorderRef.current = recorder;
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Could not start video recording.",
      );
    }
  };

  const handlePauseVideoRecording = () => {
    const recorder = videoRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    videoPreviewRef.current?.pause();
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    recorder.pause();
    setIsVideoPaused(true);
    recorder.requestData();
  };

  const handleResumeVideoRecording = () => {
    const recorder = videoRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;

    videoPreviewRef.current?.pause();
    setIsVideoPreviewPlaying(false);
    recorder.resume();
    setVideoUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setVideoBlob(null);
    setIsVideoPaused(false);
  };

  const handleStopVideoRecording = (): Promise<Blob | null> => {
    const recorder = videoRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(videoBlob);
    }

    setIsVideoRecording(false);
    setIsVideoPaused(false);
    return new Promise((resolve) => {
      videoStopResolverRef.current = resolve;
      recorder.stop();
    });
  };

  const resetVideoRecording = () => {
    const recorder = videoRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      discardVideoRef.current = true;
      recorder.stop();
    }
    videoStopResolverRef.current?.(null);
    videoStopResolverRef.current = null;
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoBlob(null);
    setVideoDuration(0);
    setIsVideoRecording(false);
    setIsVideoPaused(false);
    setIsVideoPreviewPlaying(false);
  };

  useEffect(() => {
    if (!isVideoRecording || isVideoPaused) return;

    const timer = window.setInterval(() => {
      setVideoDuration((duration) => duration + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isVideoRecording, isVideoPaused]);

  useEffect(() => {
    if (
      isVideoRecording &&
      !isVideoPaused &&
      videoPreviewRef.current &&
      videoStreamRef.current
    ) {
      videoPreviewRef.current.srcObject = videoStreamRef.current;
    }
  }, [isVideoRecording, isVideoPaused, videoUrl]);

  useEffect(() => {
    return () => {
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleSendVideoRecording = async () => {
    if (!checkMediaOnline()) return;
    const blob = isVideoRecording
      ? await handleStopVideoRecording()
      : videoBlob;
    if (!blob) return;

    // const clientMessageId = crypto.randomUUID();

    // ============================================
    // OPTIMISTIC MESSAGE — ONLINE + OFFLINE
    // ============================================

    // addOptimisticMediaMessage(queryClient, {
    //   clientMessageId,
    //   conversationId,
    //   senderId: user?.id as string,

    //   messageType: MessageType.VIDEO,

    //   file: videoBlob,
    //   fileName: `video-${clientMessageId}.webm`,
    //   mimeType: videoBlob.type || "video/webm",

    //   duration: videoDuration,
    //   replyToMessageId: replyingTo?.id ?? null,
    // });

    // ============================================
    // OFFLINE
    // ============================================

    // if (!navigator.onLine) {
    //   await addPendingMessage({
    //     clientMessageId,
    //     conversationId,
    //     ...(recipientId && { recipientId }),

    //     message: null,
    //     messageType: MessageType.VIDEO,

    //     file: videoBlob,
    //     fileName: `video-${clientMessageId}.webm`,
    //     mimeType: videoBlob.type || "video/webm",

    //     duration: videoDuration,
    //     replyToMessageId: replyingTo?.id ?? null,
    //     createdAt: new Date().toISOString(),
    //   });

    //   console.log("VIDEO SAVED OFFLINE:", clientMessageId);

    //   resetVideoRecording();
    //   scrollToBottom();

    //   return;
    // }

    // ============================================
    // ONLINE
    // ============================================

    const formData = new FormData();
    formData.append("video", blob);

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (recipientId) {
      formData.append("recipientId", recipientId);
    }

    formData.append("duration", String(videoDuration));
    // formData.append("clientMessageId", clientMessageId);

    sendVideoMutation.mutate(formData, {
      onSuccess: () => {
        resetVideoRecording();
        scrollToBottom();
      },
    });
  };

  const handleVideoAction = () => {
    if (isVideoRecording) {
      if (isVideoPaused) {
        handleResumeVideoRecording();
      } else {
        handlePauseVideoRecording();
      }
      return;
    }

    if (videoUrl) {
      handleSendVideoRecording();
      return;
    }

    handleStartVideoRecording();
  };

  const handleVideoCenterAction = async () => {
    if (isVideoRecording && !isVideoPaused) {
      handlePauseVideoRecording();
      return;
    }

    const preview = videoPreviewRef.current;
    if (!preview || !videoUrl) return;

    if (preview.paused) {
      try {
        await preview.play();
      } catch (error: unknown) {
        console.error("Could not play the video preview.", error);
        toast.error("Could not play the video preview.");
      }
    } else {
      preview.pause();
    }
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

  const handleSendMedia = async () => {
    if (!checkMediaOnline()) return;
    if (!mediaDraft) return;

    // const clientMessageId = crypto.randomUUID();

    // const messageType =
    //   mediaDraft.kind === "image"
    //     ? MessageType.IMAGE
    //     : mediaDraft.kind === "video"
    //       ? MessageType.VIDEO
    //       : MessageType.FILE;

    // ============================================
    // OPTIMISTIC MESSAGE — ONLINE + OFFLINE
    // ============================================

    // addOptimisticMediaMessage(queryClient, {
    //   clientMessageId,
    //   conversationId,
    //   senderId: user?.id as string,

    //   messageType,

    //   file: mediaDraft.file,
    //   fileName: mediaDraft.file.name,
    //   mimeType: mediaDraft.file.type,

    //   duration: null,
    //   replyToMessageId: replyingTo?.id ?? null,
    // });

    // ============================================
    // OFFLINE
    // ============================================

    // if (!navigator.onLine) {
    //   await addPendingMessage({
    //     clientMessageId,
    //     conversationId,
    //     ...(recipientId && { recipientId }),

    //     message: null,
    //     messageType,

    //     file: mediaDraft.file,
    //     fileName: mediaDraft.file.name,
    //     mimeType: mediaDraft.file.type,

    //     duration: null,
    //     replyToMessageId: replyingTo?.id ?? null,
    //     createdAt: new Date().toISOString(),
    //   });

    //   console.log("MEDIA SAVED OFFLINE:", clientMessageId);

    //   clearMediaDraft();
    //   scrollToBottom();

    //   return;
    // }

    // ============================================
    // ONLINE — EXISTING BEHAVIOR
    // ============================================

    const formData = new FormData();

    formData.append(mediaDraft.kind, mediaDraft.file);

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (recipientId) {
      formData.append("recipientId", recipientId);
    }

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

  const getReplyPreview = (replyTo: ReplyToMessage) => {
    if (replyTo.isDeleted) {
      return "This message was deleted";
    }

    if (replyTo.message?.trim()) {
      return replyTo.message;
    }

    switch (replyTo.messageType) {
      case MessageType.IMAGE:
        return "📷 Photo";

      case MessageType.VIDEO:
        return "🎥 Video";

      case MessageType.AUDIO:
        return "🎵 Audio";

      case MessageType.FILE:
        return "📎 Document";

      default:
        return "Message";
    }
  };

  //Sync media
  // useEffect(() => {
  //   const handleOnline = () => {
  //     syncPendingMedia();
  //   };

  //   window.addEventListener("online", handleOnline);

  //   return () => {
  //     window.removeEventListener("online", handleOnline);
  //   };
  // }, [syncPendingMedia]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(onSubmit)();
    }
  };

  const handleDelete = async () => {
    const clientActionId = crypto.randomUUID();

    // ----------------------------------------
    // 1. UPDATE UI IMMEDIATELY
    // ----------------------------------------

    queryClient.setQueryData<CachedMessages>(
      ["messages", editingMessage?.conversationId],
      (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((msg) =>
              msg.id === editingMessage?.id
                ? {
                    ...msg,
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                  }
                : msg,
            ),
          })),
        };
      },
    );

    // ----------------------------------------
    // 2. SAVE TO OFFLINE OUTBOX
    // ----------------------------------------

    await addPendingAction({
      clientActionId,
      type: "DELETE_MESSAGE",
      conversationId: deleteMessage?.conversationId as string,
      messageId: deleteMessage?.id,

      createdAt: new Date().toISOString(),
    });

    // ----------------------------------------
    // 3. SEND IF ONLINE
    // ----------------------------------------

    const sent = send({
      type: SocketEvent.DELETE_MESSAGE,

      conversationId: deleteMessage?.conversationId,
      messageId: deleteMessage?.id,

      clientActionId,
    });

    if (!sent) {
      console.log("📦 Delete saved to offline outbox");
    }

    // ----------------------------------------
    // 4. CLEAN UI
    // ----------------------------------------

    setDeleteMessage(null);
    setEditingMessage(null);
    reset();
  };

  return (
    <>
      <DeleteMessageDialog
        open={deleteMsg}
        onCancel={() => {
          setDeleteMessage(null)
          setDeleteMsg(false)
        }}
        onConfirm={()=>{
          handleDelete()
          setDeleteMsg(false)
        }}
      />

      <Composer onSubmit={handleSubmit(onSubmit)}>
        {replyingTo && (
          <ReplyPreview>
            <ReplyPreviewContent>
              <ReplyPreviewTitle>
                Replying to{" "}
                {replyingTo.senderId === user?.id ? "yourself" : "message"}
              </ReplyPreviewTitle>

              <ReplyPreviewText>{getReplyPreview(replyingTo)}</ReplyPreviewText>
            </ReplyPreviewContent>

            <CloseReplyButton
              type="button"
              onClick={() => {
                setReplyingTo(null);
              }}
              aria-label="Cancel reply"
            >
              <X size={18} />
            </CloseReplyButton>
          </ReplyPreview>
        )}

        {editingMessage && (
          <EditBar>
            <div>
              <EditLabel>Editing message</EditLabel>
              <EditPreview>{editingMessage.message}</EditPreview>
            </div>

            <EditActions>
              <DeleteEdit
                type="button"
                aria-label="Delete message"
                onClick={() => setDeleteMsg(true)}
              >
                <Trash2 size={16} />
              </DeleteEdit>

              <CancelEdit
                type="button"
                aria-label="Cancel edit"
                onClick={() => {
                  setEditingMessage(null);
                  reset();
                }}
              >
                <XIcon size={16} />
              </CancelEdit>
            </EditActions>
          </EditBar>
        )}

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
              onKeyDown={handleKeyDown}
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
                aria-label={editingMessage ? "Save edit" : "Send"}
                onClick={() => {
                  if (isAtBottom) {
                    scrollToBottom();
                  }
                }}
              >
                {editingMessage ? <Check size={18} /> : <Send size={18} />}
              </SendBtn>
            ) : isRecording ? (
              <CircleRecordBtn
                type="button"
                aria-label="Stop audio recording"
                $active
                onClick={stopRecording}
              >
                <CircleStop size={18} />
              </CircleRecordBtn>
            ) : (
              <>
                <CircleRecordBtn
                  type="button"
                  aria-label="Refresh messages and conversations"
                  title="Refresh messages and conversations"
                  onClick={refreshChatData}
                >
                  <RefreshCw size={17} />
                </CircleRecordBtn>
                <CircleRecordBtn
                  type="button"
                  aria-label="Record audio"
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
              <span>Photos</span>
            </AttachmentItem>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                videoInputRef.current?.click();
              }}
            >
              <AttachmentIcon $tone="#f59e0b">
                <Video size={18} />
              </AttachmentIcon>
              <span>Send video</span>
            </AttachmentItem>
            <AttachmentItem
              onClick={() => {
                setShowAttachmentMenu(false);
                handleVideoAction();
              }}
            >
              <AttachmentIcon $tone="#f59e0b">
                <CameraIcon size={18} />
              </AttachmentIcon>
              <span>Record video</span>
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
        <VoiceRecorderPanel
          isRecording={isRecording}
          isPaused={isPaused}
          audioUrl={audioUrl}
          duration={duration}
          waveformLevels={waveformLevels}
          pauseRecording={pauseRecording}
          resumeRecording={resumeRecording}
          stopRecording={stopRecording}
          discardRecording={resetAudio}
          sendRecording={handleSendAudio}
          isSending={sendAudioMutation.isPending}
        />
      </BottomSheet>

      {(isVideoRecording || videoUrl) && (
        <VideoRecorderScreen>
          <VideoRecorderTopbar>
            <VideoRecorderTitle>
              {isVideoRecording
                ? isVideoPaused
                  ? "Recording paused"
                  : "Recording video"
                : "Preview video"}
            </VideoRecorderTitle>
            <VideoTopbarActions>
              {isVideoRecording && isVideoPaused && (
                <ResumeVideoButton
                  type="button"
                  onClick={handleResumeVideoRecording}
                >
                  <Play size={15} fill="currentColor" />
                  Continue
                </ResumeVideoButton>
              )}
              {isVideoRecording && <VideoTimer>{videoDuration}s</VideoTimer>}
            </VideoTopbarActions>
          </VideoRecorderTopbar>

          <VideoPreview
            ref={videoPreviewRef}
            src={videoUrl ?? undefined}
            autoPlay={isVideoRecording && !isVideoPaused}
            muted={isVideoRecording && !isVideoPaused}
            controls={false}
            playsInline
            onPlay={() => setIsVideoPreviewPlaying(true)}
            onPause={() => setIsVideoPreviewPlaying(false)}
            onEnded={(event) => {
              event.currentTarget.currentTime = 0;
              setIsVideoPreviewPlaying(false);
            }}
          />

          <VideoRecorderActions>
            <VideoIconButton
              type="button"
              aria-label="Cancel video recording"
              title="Cancel"
              $tone="cancel"
              onClick={resetVideoRecording}
            >
              <X size={21} />
            </VideoIconButton>
            <VideoIconButton
              type="button"
              aria-label={
                isVideoRecording && !isVideoPaused
                  ? "Pause video recording"
                  : isVideoPreviewPlaying
                    ? "Pause video preview"
                    : "Play video preview"
              }
              title={
                isVideoRecording && !isVideoPaused
                  ? "Pause recording"
                  : "Play preview"
              }
              $tone="pause"
              disabled={
                isVideoRecording
                  ? isVideoPaused && !videoUrl
                  : !videoUrl
              }
              onClick={handleVideoCenterAction}
            >
              {((isVideoRecording && !isVideoPaused) ||
                isVideoPreviewPlaying) ? (
                <Pause size={21} fill="currentColor" />
              ) : (
                <Play size={21} fill="currentColor" />
              )}
            </VideoIconButton>
            <VideoIconButton
              type="button"
              aria-label="Send video"
              title="Send video"
              $tone="send"
              disabled={
                sendVideoMutation.isPending ||
                (!isVideoRecording && !videoBlob)
              }
              onClick={() => void handleSendVideoRecording()}
            >
              {sendVideoMutation.isPending ? (
                <SendingSpinner size={22} aria-label="Sending video" />
              ) : (
                <Send size={20} />
              )}
            </VideoIconButton>
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

const EditActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DeleteEdit = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  background: #fee2e2;
  color: #ef4444;

  transition: all 0.2s ease;

  &:hover {
    background: #fecaca;
  }

  &:active {
    transform: scale(0.92);
  }
`;

const EditBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
`;

const EditLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const EditPreview = styled.div`
  font-size: 12px;
  opacity: 0.65;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CancelEdit = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Composer = styled.form`
  flex-shrink: 0;
  padding: 10px 12px calc(18px + env(safe-area-inset-bottom));
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;

  @media (max-width: 767px) {
    position: fixed;
    z-index: 20;
    right: 0;
    bottom: var(--chat-visual-viewport-bottom, 0px);
    left: 0;
    width: 100vw;
  }
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

const VideoTopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ResumeVideoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
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
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const VideoIconButton = styled.button<{
  $tone: "cancel" | "pause" | "send";
}>`
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  background: ${({ $tone, theme }) =>
    $tone === "pause"
      ? "#ff4000"
      : $tone === "send"
        ? theme.colors.secondary
        : "rgba(255, 255, 255, 0.18)"};
  color: #fff;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
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
  z-index: 9999;
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

type VoiceRecorderPanelProps = {
  isRecording: boolean;
  isPaused: boolean;
  audioUrl: string | null;
  duration: number;
  waveformLevels: number[];
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  discardRecording: () => void;
  sendRecording: (blob?: Blob | null) => Promise<void>;
  isSending: boolean;
};

function VoiceRecorderPanel({
  isRecording,
  isPaused,
  audioUrl,
  duration,
  waveformLevels,
  pauseRecording,
  resumeRecording,
  stopRecording,
  discardRecording,
  sendRecording,
  isSending,
}: VoiceRecorderPanelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewAudioContext = useRef<AudioContext | null>(null);
  const previewAnalyser = useRef<AnalyserNode | null>(null);
  const previewAnimationFrame = useRef<number | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewWaveform, setPreviewWaveform] = useState(waveformLevels);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPreviewPlaying(false);
    setPreviewTime(0);
    setPreviewWaveform(waveformLevels);
  }, [audioUrl]);

  useEffect(
    () => () => {
      if (previewAnimationFrame.current !== null) {
        cancelAnimationFrame(previewAnimationFrame.current);
      }
      if (previewAudioContext.current) {
        void previewAudioContext.current.close();
      }
    },
    [],
  );

  const startPreviewVisualizer = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (!previewAudioContext.current) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = new AudioContextClass();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        context.createMediaElementSource(audio).connect(analyser);
        analyser.connect(context.destination);
        previewAudioContext.current = context;
        previewAnalyser.current = analyser;
      }

      await previewAudioContext.current.resume();
      const analyser = previewAnalyser.current;
      if (!analyser) return;

      const frequencies = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        analyser.getByteFrequencyData(frequencies);
        const barCount = waveformLevels.length;
        const levels = Array.from({ length: barCount }, (_, index) => {
          const start = Math.floor((index / barCount) * frequencies.length);
          const end = Math.max(
            start + 1,
            Math.floor(((index + 1) / barCount) * frequencies.length),
          );
          let sum = 0;
          for (let bin = start; bin < end; bin += 1) sum += frequencies[bin];
          return Math.max(0.08, Math.min(1, (sum / (end - start)) / 150));
        });
        setPreviewWaveform(levels);

        if (!audio.paused && !audio.ended) {
          previewAnimationFrame.current =
            requestAnimationFrame(updateWaveform);
        }
      };

      if (previewAnimationFrame.current !== null) {
        cancelAnimationFrame(previewAnimationFrame.current);
      }
      updateWaveform();
    } catch (error: unknown) {
      console.error("Could not analyze the audio preview waveform.", error);
    }
  };

  const toggleCenterAction = async () => {
    if (isRecording && !isPaused) {
      pauseRecording();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        toast.error("Could not play the voice recording.");
      }
    } else {
      audio.pause();
    }
  };

  const handleSend = async () => {
    const blob = await stopRecording();
    if (blob) await sendRecording(blob);
  };

  return (
    <RecBody>
      <RecHead>
        <RecStatus>
          <RecIndicator
            $recording={isRecording}
            aria-label={isRecording ? "Recording" : "Recording paused"}
          />
          <Timer>
            {Math.floor(duration / 60)}:
            {String(duration % 60).padStart(2, "0")}
          </Timer>
        </RecStatus>
        {isPaused && (
          <ResumeRecordingButton
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              resumeRecording();
            }}
          >
            <Mic size={15} />
            Continue
          </ResumeRecordingButton>
        )}
      </RecHead>

      {isRecording && !isPaused && (
        <RecordingWave role="img" aria-label="Voice recording waveform">
          {waveformLevels.map((level, index) => (
            <RecordingWaveBar key={index} $level={level} />
          ))}
        </RecordingWave>
      )}

      {audioUrl && (
        <AudioPreviewBubble>
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onLoadedMetadata={(event) =>
              setPreviewDuration(event.currentTarget.duration)
            }
            onTimeUpdate={(event) =>
              setPreviewTime(event.currentTarget.currentTime)
            }
            onPlay={() => {
              setPreviewPlaying(true);
              void startPreviewVisualizer();
            }}
            onPause={() => {
              setPreviewPlaying(false);
              if (previewAnimationFrame.current !== null) {
                cancelAnimationFrame(previewAnimationFrame.current);
                previewAnimationFrame.current = null;
              }
            }}
            onEnded={(event) => {
              event.currentTarget.currentTime = 0;
              setPreviewPlaying(false);
              setPreviewTime(0);
              if (previewAnimationFrame.current !== null) {
                cancelAnimationFrame(previewAnimationFrame.current);
                previewAnimationFrame.current = null;
              }
            }}
          />
          <AudioPreviewWave
            role="slider"
            aria-label="Audio preview position"
            aria-valuemin={0}
            aria-valuemax={Math.floor(previewDuration)}
            aria-valuenow={Math.floor(previewTime)}
            aria-valuetext={`${Math.floor(previewTime)} of ${Math.floor(previewDuration)} seconds`}
            tabIndex={0}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const position = Math.min(
                1,
                Math.max(0, (event.clientX - bounds.left) / bounds.width),
              );
              const nextTime = position * previewDuration;
              if (audioRef.current) {
                audioRef.current.currentTime = nextTime;
                setPreviewTime(nextTime);
              }
            }}
            onKeyDown={(event) => {
              if (!audioRef.current) return;
              if (event.key === "ArrowRight") {
                audioRef.current.currentTime = Math.min(
                  previewDuration,
                  previewTime + 1,
                );
              } else if (event.key === "ArrowLeft") {
                audioRef.current.currentTime = Math.max(0, previewTime - 1);
              } else {
                return;
              }
              event.preventDefault();
              setPreviewTime(audioRef.current.currentTime);
            }}
          >
            {previewWaveform.map((level, index) => (
              <AudioPreviewWaveBar
                key={index}
                $level={level}
                $played={
                  previewDuration > 0 &&
                  index / previewWaveform.length <=
                    previewTime / previewDuration
                }
              />
            ))}
          </AudioPreviewWave>
        </AudioPreviewBubble>
      )}

      <RecActions>
        <AudioActionButton
          type="button"
          aria-label="Delete voice recording"
          title="Delete recording"
          $tone="neutral"
          onClick={discardRecording}
        >
          <Trash2 size={20} />
        </AudioActionButton>

        <AudioActionButton
          type="button"
          aria-label={
            isRecording && !isPaused
              ? "Pause recording"
              : previewPlaying
                ? "Pause preview"
                : "Play preview"
          }
          title={
            isRecording && !isPaused
              ? "Pause recording"
              : previewPlaying
                ? "Pause preview"
                : "Play preview"
          }
          $tone="primary"
          disabled={!isRecording && !audioUrl}
          onClick={toggleCenterAction}
        >
          {((isRecording && !isPaused) || previewPlaying) ? (
            <Pause size={21} fill="currentColor" />
          ) : (
            <Play size={21} fill="currentColor" />
          )}
        </AudioActionButton>

        <AudioActionButton
          type="button"
          aria-label="Send voice note"
          title="Send voice note"
          $tone="send"
          disabled={isSending || (!isRecording && !audioUrl)}
          onClick={handleSend}
        >
          {isSending ? (
            <SendingSpinner size={22} aria-label="Sending voice note" />
          ) : (
            <Send size={20} />
          )}
        </AudioActionButton>
      </RecActions>
    </RecBody>
  );
}

const RecBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const RecHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;
const RecStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const RecTitle = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  font-weight: 700;
`;
const RecIndicator = styled.span<{ $recording: boolean }>`
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border-radius: 50%;
  background: ${({ $recording, theme }) =>
    $recording ? theme.colors.error : theme.colors.success};
  box-shadow: ${({ $recording }) =>
    $recording ? "0 0 0 5px rgba(255, 59, 48, 0.12)" : "none"};
  animation: ${({ $recording }) =>
    $recording ? "recordingPulse 1.2s ease-in-out infinite" : "none"};

  @keyframes recordingPulse {
    50% {
      box-shadow: 0 0 0 9px rgba(255, 59, 48, 0.04);
      opacity: 0.72;
    }
  }
`;
const Timer = styled.div`
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;
const ResumeRecordingButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;
const RecActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 2px;
`;
const AudioActionButton = styled.button<{
  $tone: "primary" | "neutral" | "send";
}>`
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $tone, theme }) =>
    $tone === "primary" || $tone === "send"
      ? "#fff"
      : theme.colors.textPrimary};
  background: ${({ $tone, theme }) =>
    $tone === "primary"
      ? theme.colors.secondary
      : $tone === "send"
        ? theme.colors.secondary
        : theme.colors.surface};
  box-shadow: ${({ $tone, theme }) =>
    $tone === "primary" ? theme.shadows.orange : theme.shadows.sm};
  transition:
    transform 160ms ease,
    opacity 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
const SendingSpinner = styled(LoaderCircle)`
  animation: audio-send-spin 0.8s linear infinite;

  @keyframes audio-send-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AudioPreviewBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 14px;
  background: transparent;
  box-shadow: none;

  audio {
    display: none;
  }
`;
const AudioPreviewWave = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  width: 100%;
  min-width: 0;
  height: 30px;
  cursor: pointer;
  touch-action: none;
`;
const AudioPreviewWaveBar = styled.span<{
  $level: number;
  $played: boolean;
}>`
  width: 3px;
  min-width: 2px;
  height: ${({ $level }) => `${Math.max(4, 4 + $level * 22)}px`};
  border-radius: 999px;
  background: ${({ $played, theme }) =>
    $played ? theme.colors.secondary : theme.colors.textSecondary};
  opacity: ${({ $played }) => ($played ? 1 : 0.45)};
  transition:
    height 80ms ease,
    background 100ms ease;
`;
const RecordingWave = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: 44px;
  padding: 0 4px;
`;
const RecordingWaveBar = styled.span<{ $level: number }>`
  width: 3px;
  height: ${({ $level }) => `${Math.max(4, 4 + $level * 32)}px`};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.secondary};
  opacity: ${({ $level }) => 0.55 + $level * 0.45};
  transition:
    height 80ms ease,
    opacity 80ms ease;
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

const ReplyPreview = styled.div`
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 8px 12px;

  margin: 0 12px 6px;

  border-left: 3px solid ${({ theme }) => theme.colors.primary};

  background: rgba(255, 255, 255, 0.04);

  border-radius: 8px;
`;

const ReplyPreviewContent = styled.div`
  min-width: 0;
  flex: 1;
`;

const ReplyPreviewTitle = styled.div`
  font-size: 12px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ReplyPreviewText = styled.div`
  margin-top: 2px;

  font-size: 13px;

  color: ${({ theme }) => theme.colors.textPrimary};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseReplyButton = styled.button`
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background: transparent;

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;
