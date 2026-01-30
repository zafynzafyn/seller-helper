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
  const state = searchParams.get("state");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "updatedAt";
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

    if (state && state !== "all") {
      where.state = state;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Build order by
    const orderBy: Record<string, string> = {};
    if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "views") {
      orderBy.views = sortOrder;
    } else if (sortBy === "favorites") {
      orderBy.favorites = sortOrder;
    } else {
      orderBy.updatedAt = sortOrder;
    }

    // Get total count
    const total = await prisma.listing.count({ where });

    // Get listings
    const listings = await prisma.listing.findMany({
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
            orderItems: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Listings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
