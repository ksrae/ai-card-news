import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const content = await prisma.contents.findUnique({
      where: { id },
      include: {
        card_slides: {
          orderBy: { slide_order: 'asc' }
        }
      }
    });

    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Cascade delete will automatically remove related card_slides
    await prisma.contents.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Content deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
