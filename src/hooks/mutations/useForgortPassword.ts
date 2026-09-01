import { forgotPassword } from "#/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success(data.message); // Display success message
        },
        onError: (error) => {
            toast.error("An error occurred while requesting password reset."); // Display error message
            // You can also log the error or perform any other error handling here
            console.error("Forgot password error:", error);
            // Handle error case
        }
    });
};