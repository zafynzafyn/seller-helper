"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardStats, ChartDataPoint, TopListing } from "@/types";

interface AnalyticsResponse {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  topListings: TopListing[];
}

export function useAnalytics(storeId?: string, period: string = "30d") {
  return useQuery<AnalyticsResponse>({
    queryKey: ["analytics", storeId, period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (storeId) params.set("storeId", storeId);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });
}
