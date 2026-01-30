import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const storeId = searchParams.get("storeId");
  const period = searchParams.get("period") || "30d";

  // Get date range
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  // Previous period for comparison
  const periodDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - periodDays);
  const previousEndDate = new Date(startDate);

  try {
    // Get stores for user
    const storeWhere = storeId
      ? { id: storeId, userId: session.user.id }
      : { userId: session.user.id };

    const stores = await prisma.store.findMany({
      where: storeWhere,
      select: { id: true },
    });

    const storeIds = stores.map((s) => s.id);

    if (storeIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          totalViews: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          totalFees: 0,
          netRevenue: 0,
          revenueChange: 0,
          ordersChange: 0,
        },
        chartData: [],
        topListings: [],
      });
    }

    // Current period metrics
    const currentOrders = await prisma.order.findMany({
      where: {
        storeId: { in: storeIds },
        etsyCreatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Previous period metrics for comparison
    const previousOrders = await prisma.order.findMany({
      where: {
        storeId: { in: storeIds },
        etsyCreatedAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    // Calculate stats
    const totalRevenue = currentOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    const totalOrders = currentOrders.length;
    const totalFees = currentOrders.reduce(
      (sum, o) => sum + o.etsyFees + o.processingFees,
      0
    );
    const netRevenue = currentOrders.reduce(
      (sum, o) => sum + (o.netRevenue || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get views from listings
    const listings = await prisma.listing.findMany({
      where: { storeId: { in: storeIds } },
      select: { views: true, favorites: true },
    });
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const conversionRate =
      totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    // Previous period stats for comparison
    const previousRevenue = previousOrders.reduce(
      (sum, o) => sum + o.orderTotal,
      0
    );
    const previousOrdersCount = previousOrders.length;

    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
    const ordersChange =
      previousOrdersCount > 0
        ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100
        : 0;

    // Chart data - daily revenue
    const chartData: Array<{
      date: string;
      revenue: number;
      orders: number;
    }> = [];

    const dateMap = new Map<string, { revenue: number; orders: number }>();

    currentOrders.forEach((order) => {
      if (order.etsyCreatedAt) {
        const dateKey = order.etsyCreatedAt.toISOString().split("T")[0];
        const existing = dateMap.get(dateKey) || { revenue: 0, orders: 0 };
        dateMap.set(dateKey, {
          revenue: existing.revenue + order.orderTotal,
          orders: existing.orders + 1,
        });
      }
    });

    // Fill in missing dates
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toISOString().split("T")[0];
      const data = dateMap.get(dateKey) || { revenue: 0, orders: 0 };
      chartData.push({
        date: dateKey,
        ...data,
      });
      current.setDate(current.getDate() + 1);
    }

    // Top performing listings
    const topListings = await prisma.listing.findMany({
      where: { storeId: { in: storeIds }, state: "active" },
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        views: true,
        favorites: true,
        primaryImageUrl: true,
        price: true,
      },
    });

    // Get order counts for top listings
    const topListingsWithOrders = await Promise.all(
      topListings.map(async (listing) => {
        const orderCount = await prisma.orderItem.count({
          where: { listingId: listing.id },
        });
        const revenue = await prisma.orderItem.aggregate({
          where: { listingId: listing.id },
          _sum: { price: true },
        });
        return {
          ...listing,
          orders: orderCount,
          revenue: revenue._sum.price || 0,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalViews,
        conversionRate,
        averageOrderValue,
        totalFees,
        netRevenue,
        revenueChange,
        ordersChange,
      },
      chartData,
      topListings: topListingsWithOrders,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
