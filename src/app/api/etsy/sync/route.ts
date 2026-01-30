import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EtsyClient } from "@/lib/etsy";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { storeId, syncType = "all" } = await request.json();

    // Verify store belongs to user
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const client = await EtsyClient.fromStore(storeId);
    if (!client) {
      return NextResponse.json(
        { error: "Failed to connect to Etsy" },
        { status: 500 }
      );
    }

    const results: { listings?: number; orders?: number } = {};

    if (syncType === "all" || syncType === "listings") {
      results.listings = await client.syncListings(storeId);
    }

    if (syncType === "all" || syncType === "orders") {
      results.orders = await client.syncOrders(storeId, 30);
    }

    return NextResponse.json({
      success: true,
      synced: results,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
