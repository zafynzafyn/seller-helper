import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  try {
    const optimization = await prisma.aIOptimization.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            store: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!optimization) {
      return NextResponse.json(
        { error: "Optimization not found" },
        { status: 404 }
      );
    }

    if (optimization.listing.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update optimization status
    const updated = await prisma.aIOptimization.update({
      where: { id },
      data: { status },
    });

    // If approved, update the listing
    if (status === "approved") {
      const updateData: Record<string, unknown> = {};

      if (optimization.type === "title") {
        updateData.title = optimization.suggestedContent;
      } else if (optimization.type === "description") {
        updateData.description = optimization.suggestedContent;
      } else if (optimization.type === "tags") {
        updateData.tags = optimization.suggestedContent
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.listing.update({
          where: { id: optimization.listingId },
          data: updateData,
        });
      }
    }

    return NextResponse.json({ success: true, optimization: updated });
  } catch (error) {
    console.error("Optimization update error:", error);
    return NextResponse.json(
      { error: "Failed to update optimization" },
      { status: 500 }
    );
  }
}
