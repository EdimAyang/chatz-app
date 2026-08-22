import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/error-message";

export const useLogin = () => {
  const setLogin = useAuthStore((state) => state.login);
  

  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      // toast.success(data.message);
      setLogin(data.token, data.user);
    },

    onError: (error)=>{
      toast.error(getErrorMessage(error))
    }
  });
};
