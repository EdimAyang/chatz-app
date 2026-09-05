import { useCallback } from "react";

type ScrollDirection = "top" | "bottom";

type InfiniteScrollOptions = {
  direction?: ScrollDirection;
  threshold?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage: () => Promise<unknown>;
};

export const useInfiniteScroll = ({
  direction = "bottom",
  threshold = 120,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollOptions) => {
  return useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;

      const element = event.currentTarget;
      const reachedEdge =
        direction === "top"
          ? element.scrollTop <= threshold
          : element.scrollHeight - element.scrollTop - element.clientHeight <=
            threshold;

      if (reachedEdge) {
        void fetchNextPage();
      }
    },
    [direction, fetchNextPage, hasNextPage, isFetchingNextPage, threshold],
  );
};
