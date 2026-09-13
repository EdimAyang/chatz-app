import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api/message.api";
import { getErrorMessage } from "@/utils/error-message";
import toast from "react-hot-toast";
import { sendAudio } from "#/api/sendAudio.api";
import { sendFile, sendImage, sendVideo } from "#/api/sendMedia.api";
import type { CachedMessages } from "#/store/websocket.store";

const updateMessageCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  data: any,
) => {
  const message = data.message;

  if (!message) return;

  const conversationId = message.conversationId;

  queryClient.setQueryData<CachedMessages>(
    ["messages", conversationId],
    (old) => {
      if (!old?.pages?.length) return old;

      const pages = [...old.pages];

      const firstPage = pages[0];

      const alreadyExists = firstPage.messages.some(
        (item) => item.id === message.id,
      );

      if (alreadyExists) {
        return old;
      }

      pages[0] = {
        ...firstPage,
        messages: [
          ...firstPage.messages,
          message,
        ],
      };

      return {
        ...old,
        pages,
      };
    },
  );

    const updatedData = queryClient.getQueryData(["messages", conversationId]);

  console.log("UPDATED CACHE:", updatedData);
};

// const updateMessageCache = (
//   queryClient: ReturnType<typeof useQueryClient>,
//   data: any,
// ) => {
//   const message = data.message;

//   if (!message) {
//     console.error("No message returned:", data);
//     return;
//   }

//   const conversationId = message.conversationId;

//   queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
//     if (!oldData?.pages?.length) {
//       return oldData;
//     }

//     return {
//       ...oldData,
//       pages: oldData.pages.map((page: any, index: number) => {
//         if (index !== 0) return page;

//         return {
//           ...page,
//           messages: [message, ...(page.messages ?? [])],
//         };
//       }),
//     };
//   });

//   const updatedData = queryClient.getQueryData(["messages", conversationId]);

//   console.log("UPDATED CACHE:", updatedData);
// };



export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["messages"],
    mutationFn: sendMessage,

    onSuccess: (data) => {
      updateMessageCache(queryClient, data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
};

export const useSendAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["audio"],
    mutationFn: sendAudio,
    onSuccess: (data) => {
      console.log("MEDIA MESSAGE RESPONSE:", data);

      updateMessageCache(queryClient, data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
};

export const useSendImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["image"],
    mutationFn: sendImage,
    onSuccess: (data) => {
      updateMessageCache(queryClient, data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
};

export const useSendVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["video"],
    mutationFn: sendVideo,
    onSuccess: (data) => {
      updateMessageCache(queryClient, data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
};

export const useSendFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["file"],
    mutationFn: sendFile,
    onSuccess: (data) => {
      updateMessageCache(queryClient, data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
};
