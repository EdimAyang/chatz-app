import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/message.api";

export const useGetMessageQuery = (id: string, limit: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", id],

    queryFn: ({ pageParam }) => {
      return getMessages(id, limit, pageParam ?? "");
    },

    initialPageParam: "",

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    enabled: !!id,
  });
};
