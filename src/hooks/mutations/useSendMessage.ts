import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "@/api/message.api";
import { getErrorMessage } from "@/utils/error-message";
import toast  from "react-hot-toast";
import { sendAudio } from "#/api/sendAudio.api";



export const useSendMessage = () => {

  // const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["messages"],
    mutationFn: sendMessage,

    onSuccess: () => {
      
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  });
};

export const useSendAudio = () => {

  // const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["audio"],
    mutationFn: sendAudio,

    onSuccess: () => {
      
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  });
};