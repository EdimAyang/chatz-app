import { useLogin } from "./mutations/useLogin";
import { useRegister } from "./mutations/useRegister";

export const useAuth = () => {
  const login = useLogin();
  const signUp = useRegister();

  return {
    login,
    signUp,
  };
};