import {resetPassword} from "@/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            resetPassword(token, password),
        onSuccess: (data) => {
            toast.success(data.message); // Display success message
        },
        onError: (error) => {
            toast.error("An error occurred while resetting the password."); // Display error message
            console.error("Reset password error:", error);
        }
    });
};