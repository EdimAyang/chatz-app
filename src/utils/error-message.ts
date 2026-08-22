
import { AxiosError } from "axios";

// interface ApiError {
//   message: string;
// }

export const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};