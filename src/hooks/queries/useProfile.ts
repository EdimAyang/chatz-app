import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/profile.api";
import { useAuthStore } from "@/store/auth.store";

export const useProfileQuery = (id: string) => {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ["profile", id],
        queryFn: () => getUserProfile(id),
        enabled: isAuthenticated && !!id,
    })
};