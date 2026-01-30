"use client";

import { useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useStores } from "@/hooks/use-stores";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  Percent,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [selectedStore, setSelectedStore] = useState<string>("");

  const { data: stores } = useStores();
  const { data: analytics, isLoading } = useAnalytics(
    selectedStore || undefined,
    period
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your store performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stores && stores.length > 1 && (
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
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="fees">Fees Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {isLoading ? (
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
              />
              <StatCard
                title="Total Views"
                value={formatNumber(analytics?.stats.totalViews || 0)}
                icon={Eye}
              />
              <StatCard
                title="Conversion Rate"
                value={formatPercent(analytics?.stats.conversionRate || 0)}
                icon={Percent}
              />
            </div>
          )}

          {/* Charts */}
          {isLoading ? (
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
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
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
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Gross Revenue"
                  value={formatCurrency(analytics?.stats.totalRevenue || 0)}
                  icon={DollarSign}
                />
                <StatCard
                  title="Total Fees"
                  value={formatCurrency(analytics?.stats.totalFees || 0)}
                  icon={Receipt}
                />
                <StatCard
                  title="Net Revenue"
                  value={formatCurrency(analytics?.stats.netRevenue || 0)}
                  icon={TrendingUp}
                />
              </div>
              <RevenueChart
                data={analytics?.chartData || []}
                title="Revenue Trend"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Transaction Fees</p>
                      <p className="text-sm text-muted-foreground">
                        6.5% of item price
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(
                        (analytics?.stats.totalRevenue || 0) * 0.065
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Listing Fees</p>
                      <p className="text-sm text-muted-foreground">
                        $0.20 per listing
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency((analytics?.stats.totalOrders || 0) * 0.2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Payment Processing</p>
                      <p className="text-sm text-muted-foreground">
                        3% + $0.25 per order
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(
                        (analytics?.stats.totalRevenue || 0) * 0.03 +
                          (analytics?.stats.totalOrders || 0) * 0.25
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t-2">
                    <p className="font-semibold">Total Fees</p>
                    <p className="font-bold text-lg">
                      {formatCurrency(analytics?.stats.totalFees || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
