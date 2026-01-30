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
  const search = searchParams.get("search");
  const tag = searchParams.get("tag");
  const sortBy = searchParams.get("sortBy") || "lastOrderAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Get user's stores
    const stores = await prisma.store.findMany({
      where: storeId
        ? { id: storeId, userId: session.user.id }
        : { userId: session.user.id },
      select: { id: true },
    });

    const storeIds = stores.map((s) => s.id);

    if (storeIds.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      storeId: { in: storeIds },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    // Build order by
    const orderBy: Record<string, string> = {};
    if (sortBy === "totalSpent") {
      orderBy.totalSpent = sortOrder;
    } else if (sortBy === "totalOrders") {
      orderBy.totalOrders = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else {
      orderBy.lastOrderAt = sortOrder;
    }

    // Get total count
    const total = await prisma.customer.count({ where });

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        store: {
          select: {
            shopName: true,
          },
        },
        _count: {
          select: {
            orders: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
