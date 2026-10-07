import { useMutation } from "@tanstack/react-query";
import { completeSignup, register, startSignup } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/error-message";

export const useRegister = () => {
  const loginStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: register,

    onSuccess: (data) => {
      toast.success(data.message);
      loginStore(data.token, data.user);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useStartSignup = () => {
  return useMutation({
    mutationFn: ({ email, name }: { email: string; name: string }) => {
      return startSignup(email, name);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
};

export const useCompleteSignup = () => {
  return useMutation({
    mutationFn: ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }) => {
      return completeSignup(token, password, confirmPassword);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
};
