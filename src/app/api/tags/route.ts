import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tags = await prisma.tags.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        _count: {
          select: { contents: true }
        }
      }
    });

    return NextResponse.json(tags.map(t => ({
      id: t.id,
      name: t.name,
      count: t._count.contents
    })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
