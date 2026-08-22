import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUser, getUsers } from "#/api/users.api";

export const useGetUsersQuery = (limit: string) => {
  return useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam }) => getUsers(limit, pageParam ?? ""),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useGetUserQuery = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
};
