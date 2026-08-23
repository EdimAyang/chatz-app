import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "@/api/conversation.api";

export const useGetConversationsQuery = (limit: string, search?: string, auth?:boolean) => {
  return useInfiniteQuery({
    queryKey: ["conversations", search],
    queryFn: ({ pageParam }) =>
      getConversations(limit, pageParam ?? "", search ?? ""),

    initialPageParam: "",

    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled:auth
  });
};
