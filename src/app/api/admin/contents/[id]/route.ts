import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.contents.findUnique({
      where: { id },
      include: {
        card_slides: {
          orderBy: { slide_order: 'asc' }
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Flatten tags
    const formattedContent = {
      ...content,
      tags: content.tags.map((t: typeof content.tags[0]) => t.tag)
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { title, category, status, tagIds } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    // Update content
    const updated = await prisma.contents.update({
      where: { id },
      data: updateData
    });

    // Update tags if provided
    if (tagIds !== undefined && Array.isArray(tagIds)) {
      // Remove existing tags
      await prisma.contentTags.deleteMany({
        where: { content_id: id }
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.contentTags.createMany({
          data: tagIds.map((tagId: string) => ({
            content_id: id,
            tag_id: tagId
          }))
        });
      }
    }

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
