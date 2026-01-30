"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Customer, CustomerFilters, PaginatedResponse, CustomerWithRelations } from "@/types";

export function useCustomers(
  filters: CustomerFilters & { storeId?: string; page?: number; limit?: number } = {}
) {
  const { storeId, search, tags, sortBy, sortOrder, page = 1, limit = 20 } = filters;

  return useQuery<PaginatedResponse<Customer & { store: { shopName: string }; _count: { orders: number; notes: number } }>>({
    queryKey: ["customers", { storeId, search, tags, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (storeId) params.set("storeId", storeId);
      if (search) params.set("search", search);
      if (tags?.length) params.set("tag", tags[0]);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<CustomerWithRelations>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useUpdateCustomerTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}

export function useAddCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      content,
      type = "note",
      dueDate,
    }: {
      customerId: string;
      content: string;
      type?: "note" | "followup" | "feedback";
      dueDate?: string;
    }) => {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type, dueDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      return response.json();
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
}

export function useToggleNoteComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      noteId,
      isCompleted,
    }: {
      customerId: string;
      noteId: string;
      isCompleted: boolean;
    }) => {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      return response.json();
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
}
