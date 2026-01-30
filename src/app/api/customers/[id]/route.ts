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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            shopName: true,
            userId: true,
          },
        },
        orders: {
          orderBy: { etsyCreatedAt: "desc" },
          take: 10,
          include: {
            items: {
              include: {
                listing: {
                  select: {
                    title: true,
                    primaryImageUrl: true,
                  },
                },
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Verify ownership
    if (customer.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        store: {
          select: { userId: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        tags: body.tags,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
