import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, uploadProfileAvatar } from "@/api/profile.api";
import { getErrorMessage } from "@/utils/error-message";
import toast  from "react-hot-toast";



export const useUpdateProfile = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: updateUserProfile,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  });
};

export const useUpdateProfileAvatar = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfileAvatar"],
    mutationFn: uploadProfileAvatar,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(data.message)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  });
};