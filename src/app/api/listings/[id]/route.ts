import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            shopName: true,
            userId: true,
          },
        },
        aiOptimizations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        orderItems: {
          include: {
            order: {
              select: {
                etsyCreatedAt: true,
                buyerName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Verify ownership
    if (listing.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Listing fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        store: {
          select: { userId: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        tags: body.tags,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Listing update error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
