import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const PAGE_SIZE = 9;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const skip = (page - 1) * PAGE_SIZE;

    // Build where clause
    const conditions: any[] = [];

    // Tag filter
    if (tag) {
      conditions.push({
        tags: {
          some: {
            tag: {
              name: tag
            }
          }
        }
      });
    }

    // Search filter (title OR tag name)
    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          {
            tags: {
              some: {
                tag: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            }
          }
        ]
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [contents, total] = await Promise.all([
      prisma.contents.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          category: true,
          created_at: true,
          thumbnail_url: true,
          tags: {
            select: {
              tag: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.contents.count({ where })
    ]);

    // Flatten tags
    const formattedContents = contents.map((c: typeof contents[0]) => ({
      ...c,
      tags: c.tags.map((t: typeof c.tags[0]) => t.tag.name)
    }));

    return NextResponse.json({
      contents: formattedContents,
      hasMore: skip + contents.length < total,
      total
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch contents" }, { status: 500 });
  }
}
