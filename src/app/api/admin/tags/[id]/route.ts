import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Update tag
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // Check for duplicate (excluding current tag)
    const existing = await prisma.tags.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        NOT: { id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 });
    }

    const updated = await prisma.tags.update({
      where: { id },
      data: { name: name.trim() }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// Delete tag
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cascade delete will automatically remove content_tags relationships
    await prisma.tags.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
