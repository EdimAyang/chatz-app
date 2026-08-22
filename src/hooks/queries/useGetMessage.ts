import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/message.api";

export const useGetMessageQuery = (id: string, limit: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", id],
    queryFn: ({ pageParam }) => getMessages(id, limit, pageParam ?? ""),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!id
  });
}; 