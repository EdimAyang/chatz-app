import toast from "react-hot-toast";

export const checkMediaOnline = () => {
  if (!navigator.onLine) {
    toast.error("You're offline. Media can only be sent when you're online.");
    return false;
  }

  return true;
};
