import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api/message.api";
import { getErrorMessage } from "@/utils/error-message";
import toast from "react-hot-toast";
import { sendAudio } from "#/api/sendAudio.api";
import { sendFile, sendImage, sendVideo } from "#/api/sendMedia.api";

const updateMessageCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  data: any,
) => {
  const conversationId = data.message.conversationId;

  queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages
        ? [
            {
              ...oldData.pages[0],
              messages: [data.message, ...(oldData.pages[0]?.messages || [])],
            },
            ...oldData.pages.slice(1),
          ]
        : oldData,
    };
  });

  void queryClient.invalidateQueries({
    queryKey: ["messages", conversationId],
  });
};

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
