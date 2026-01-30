import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateOptimization, OptimizationType } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId, type } = await request.json();

    if (!listingId || !type) {
      return NextResponse.json(
        { error: "Missing listingId or type" },
        { status: 400 }
      );
    }

    // Get listing and verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        store: {
          select: { userId: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.store.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Generate optimization
    const result = await generateOptimization(type as OptimizationType, {
      currentTitle: listing.title,
      currentDescription: listing.description || "",
      currentTags: listing.tags,
      price: listing.price,
    });

    // Save optimization to database
    const optimization = await prisma.aIOptimization.create({
      data: {
        listingId,
        type,
        originalContent:
          type === "title"
            ? listing.title
            : type === "description"
            ? listing.description || ""
            : type === "tags"
            ? listing.tags.join(", ")
            : "SEO Analysis",
        suggestedContent: result.suggestion,
        metadata: result.metadata ? JSON.parse(JSON.stringify(result.metadata)) : null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      optimization: {
        id: optimization.id,
        type,
        suggestion: result.suggestion,
        reasoning: result.reasoning,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    console.error("AI optimization error:", error);
    return NextResponse.json(
      { error: "Failed to generate optimization" },
      { status: 500 }
    );
  }
}
