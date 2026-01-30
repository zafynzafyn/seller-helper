import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content, type = "note", dueDate } = await request.json();

  try {
    // Verify ownership
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

    const note = await prisma.customerNote.create({
      data: {
        customerId: id,
        content,
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Note create error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
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

  const { noteId, isCompleted } = await request.json();

  try {
    const note = await prisma.customerNote.findUnique({
      where: { id: noteId },
      include: {
        customer: {
          include: {
            store: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.customer.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.customerNote.update({
      where: { id: noteId },
      data: { isCompleted },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Note update error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await request.json();

  try {
    const note = await prisma.customerNote.findUnique({
      where: { id: noteId },
      include: {
        customer: {
          include: {
            store: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.customer.store.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.customerNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Note delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
