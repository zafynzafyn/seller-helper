"use client";

import { useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useStores, useSyncStore } from "@/hooks/use-stores";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { TopListings } from "@/components/dashboard/top-listings";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  RefreshCw,
  Store,
  Plus,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d");
  const [selectedStore, setSelectedStore] = useState<string>("");

  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(
    selectedStore || undefined,
    period
  );
  const syncMutation = useSyncStore();

  const handleSync = () => {
    if (selectedStore || (stores && stores.length > 0)) {
      syncMutation.mutate({
        storeId: selectedStore || stores![0].id,
        syncType: "all",
      });
    }
  };

  const hasStores = stores && stores.length > 0;

  if (storesLoading) {
    return <DashboardSkeleton />;
  }

  if (!hasStores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Connect Your Etsy Store</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your Etsy store to start tracking your sales, managing listings,
          and optimizing your business.
        </p>
        <Button variant="etsy" asChild>
          <Link href="/api/etsy/connect">
            <Plus className="mr-2 h-4 w-4" />
            Connect Etsy Store
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Etsy store performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stores.length > 1 && (
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {analyticsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics?.stats.totalRevenue || 0)}
            icon={DollarSign}
            trend={
              analytics?.stats.revenueChange
                ? {
                    value: Math.abs(analytics.stats.revenueChange),
                    isPositive: analytics.stats.revenueChange >= 0,
                  }
                : undefined
            }
            description="vs previous period"
          />
          <StatCard
            title="Total Orders"
            value={formatNumber(analytics?.stats.totalOrders || 0)}
            icon={ShoppingCart}
            trend={
              analytics?.stats.ordersChange
                ? {
                    value: Math.abs(analytics.stats.ordersChange),
                    isPositive: analytics.stats.ordersChange >= 0,
                  }
                : undefined
            }
            description="vs previous period"
          />
          <StatCard
            title="Total Views"
            value={formatNumber(analytics?.stats.totalViews || 0)}
            icon={Eye}
          />
          <StatCard
            title="Conversion Rate"
            value={formatPercent(analytics?.stats.conversionRate || 0)}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Secondary Stats */}
      {!analyticsLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Average Order Value"
            value={formatCurrency(analytics?.stats.averageOrderValue || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Total Fees"
            value={formatCurrency(analytics?.stats.totalFees || 0)}
            icon={DollarSign}
            className="text-red-600"
          />
          <StatCard
            title="Net Revenue"
            value={formatCurrency(analytics?.stats.netRevenue || 0)}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Charts */}
      {analyticsLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueChart data={analytics?.chartData || []} />
          <OrdersChart data={analytics?.chartData || []} />
        </div>
      )}

      {/* Top Listings */}
      {analyticsLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <TopListings listings={analytics?.topListings || []} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
