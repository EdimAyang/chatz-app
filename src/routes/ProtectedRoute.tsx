import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "@/lib/paths";
import { LoadingScreen } from "@/components/app/Loader";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useAuthStore, useUserProfile } from "@/store/auth.store";
import { useWebSocketStore } from "@/store/websocket.store";
import { useEffect } from "react";
import toast from "react-hot-toast";

const ProtectedRoute = () => {
  const { isAuthenticated, hydrated, user, token } = useAuthStore();

  const { setProfile } = useUserProfile();
  const { connect } = useWebSocketStore();

  const { data, error } = useProfileQuery(user?.id || "");

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to fetch profile data");
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setProfile(data);
    }
  }, [data, setProfile]);

  useEffect(() => {
    if (!isAuthenticated && !token) return;

    connect(token);
  }, [connect, isAuthenticated, token]);

  if (error) {
    throw error;
  }

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.AUTH.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
