"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Listing, ListingFilters, PaginatedResponse, ListingWithRelations } from "@/types";

export function useListings(
  filters: ListingFilters & { storeId?: string; page?: number; limit?: number } = {}
) {
  const { storeId, state, search, sortBy, sortOrder, page = 1, limit = 20 } = filters;

  return useQuery<PaginatedResponse<Listing & { store: { shopName: string }; _count: { orderItems: number } }>>({
    queryKey: ["listings", { storeId, state, search, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (storeId) params.set("storeId", storeId);
      if (state) params.set("state", state);
      if (search) params.set("search", search);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
  });
}

export function useListing(id: string) {
  return useQuery<ListingWithRelations>({
    queryKey: ["listings", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Listing, "title" | "description" | "price" | "tags">>;
    }) => {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update listing");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings", id] });
    },
  });
}
