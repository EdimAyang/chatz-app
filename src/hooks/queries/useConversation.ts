import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "@/api/conversation.api";

export const useGetConversationsQuery = (limit: string, search?: string) => {
  return useInfiniteQuery({
    queryKey: ["conversations", search],
    queryFn: ({ pageParam }) =>
      getConversations(limit, pageParam ?? "", search ?? ""),

    initialPageParam: "",

    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
