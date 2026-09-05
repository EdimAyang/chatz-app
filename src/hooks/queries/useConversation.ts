import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "@/api/conversation.api";

export const useGetConversationsQuery = (
  limit: string,
  search = "",
  auth = false,
) => {
  return useInfiniteQuery({
    queryKey: ["conversations", search, limit],

    queryFn: ({ pageParam }) => getConversations(limit, pageParam, search),

    initialPageParam: "",

    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,

    enabled: auth,
  });
};
