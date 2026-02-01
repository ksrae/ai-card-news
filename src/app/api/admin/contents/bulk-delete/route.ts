import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // Delete all contents with the provided IDs
    await prisma.contents.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} contents deleted successfully`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete contents' }, { status: 500 });
  }
}
