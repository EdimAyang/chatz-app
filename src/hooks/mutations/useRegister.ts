import { useMutation } from "@tanstack/react-query";
import { register } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import toast  from "react-hot-toast";
import { getErrorMessage } from "@/utils/error-message";

export const useRegister = () => {
  const loginStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: register,

    onSuccess: (data) => {
      toast.success(data.message)
      loginStore(data.token, data.user);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error.message));
    },
  });
};
