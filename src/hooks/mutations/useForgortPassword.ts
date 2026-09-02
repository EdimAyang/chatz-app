import { forgotPassword } from "#/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success(data.message); // Display success message
        }
    });
};