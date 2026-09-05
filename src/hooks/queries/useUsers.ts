import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUsers, getUser } from "#/api/users.api";

export const useGetUsersQuery = (
  limit = 10,
  search = "",
) => {
  return useInfiniteQuery({
    queryKey: ["users", search, limit],

    queryFn: ({ pageParam }) =>
      getUsers(pageParam, limit, search),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined,
  });
};


export const useGetUserQuery = (id:string)=>{
  return useQuery({
    queryKey:["user", id],
    queryFn:()=>getUser(id),
    enabled:!!id
  })
}

