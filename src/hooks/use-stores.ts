"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Store } from "@/types";

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      return response.json();
    },
  });
}

export function useStore(storeId: string) {
  return useQuery<Store>({
    queryKey: ["stores", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: !!storeId,
  });
}

export function useSyncStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      syncType = "all",
    }: {
      storeId: string;
      syncType?: "all" | "listings" | "orders";
    }) => {
      const response = await fetch("/api/etsy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, syncType }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
