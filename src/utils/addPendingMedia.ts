import { addPendingMessage } from "#/lib/offline/messageQueue";
import type { CachedMessages } from "#/store/websocket.store";
import type { ChatMessage } from "#/types";
import type { useQueryClient } from "@tanstack/react-query";

export const addPendingMedia = async ({
  conversationId,
  recipientId,
  file,
  fileName,
  mimeType,
  messageType,
  duration = null,
  replyToMessageId = null,
}: {
  conversationId: string;
  recipientId?: string;
  file: Blob;
  fileName: string;
  mimeType: string;
  messageType: ChatMessage["messageType"];
  duration?: number | null;
  replyToMessageId?: string | null;
}) => {
  const clientMessageId = crypto.randomUUID();

  await addPendingMessage({
    clientMessageId,
    conversationId,
    recipientId,
    message: null,
    messageType,
    file,
    fileName,
    mimeType,
    duration,
    replyToMessageId,
    createdAt: new Date().toISOString(),
  });

  return clientMessageId;
};


export const addOptimisticMediaMessage = (
  queryClient: ReturnType<typeof useQueryClient>,
  {
    clientMessageId,
    conversationId,
    senderId,
    messageType,
    file,
    fileName,
    mimeType,
    duration,
    replyToMessageId,
  }: {
    clientMessageId: string;
    conversationId: string;
    senderId: string;
    messageType: ChatMessage["messageType"];
    file: Blob;
    fileName: string;
    mimeType: string;
    duration?: number | null;
    replyToMessageId?: string | null;
  },
) => {
  const queryKey = ["messages", conversationId];

  console.log("=================================");
  console.log("OPTIMISTIC MEDIA");
  console.log("conversationId:", conversationId);
  console.log("queryKey:", queryKey);
  console.log("clientMessageId:", clientMessageId);

  const previewUrl = URL.createObjectURL(file);

  const optimisticMessage: ChatMessage = {
    id: clientMessageId,
    clientMessageId,

    conversationId,
    senderId,
    fileName,

    message: "",
    messageType,

    attachmentUrl: previewUrl,
    attachmentPublicId: null,

    mimeType,
    duration: duration ?? null,

    isRead: false,
    readAt: null,

    createdAt: new Date().toISOString(),
    updatedAt: null,

    isDeleted: false,
    deletedAt: null,
    editedAt: null,

    replyToMessageId: replyToMessageId ?? null,
    replyTo: null,

    reactions: [],

    status: "sending",
  };

  console.log("OPTIMISTIC MESSAGE:", optimisticMessage);

  queryClient.setQueryData<CachedMessages>(
    queryKey,
    (old) => {
      console.log("CACHE BEFORE UPDATE:", old);

      if (!old?.pages?.length) {
        console.log("NO EXISTING PAGES — CREATING PAGE 0");

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

      const pages = [...old.pages];

      const firstPage = pages[0];

      const alreadyExists = firstPage.messages.some(
        (item) => item.id === optimisticMessage.id,
      );

      if (alreadyExists) {
        console.log("MESSAGE ALREADY EXISTS");
        return old;
      }

      pages[0] = {
        ...firstPage,
        messages: [
          ...firstPage.messages,
          optimisticMessage,
        ],
      };

      const newData = {
        ...old,
        pages,
      };

      console.log("CACHE AFTER UPDATE:", newData);

      return newData;
    },
  );

  // VERY IMPORTANT
  const cacheAfterUpdate =
    queryClient.getQueryData<CachedMessages>(queryKey);

  console.log("CACHE DIRECTLY AFTER setQueryData:");
  console.log(cacheAfterUpdate);

  console.log(
    "OPTIMISTIC MESSAGE EXISTS:",
    cacheAfterUpdate?.pages?.some((page) =>
      page.messages.some(
        (message) => message.id === clientMessageId,
      ),
    ),
  );

  console.log("=================================");

  return previewUrl;
};