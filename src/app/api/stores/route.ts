import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stores = await prisma.store.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        etsyShopId: true,
        shopName: true,
        shopUrl: true,
        currency: true,
        lastSyncAt: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            orders: true,
            customers: true,
          },
        },
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Stores fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
