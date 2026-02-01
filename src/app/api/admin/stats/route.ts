import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DAILY_LIMIT = 3;

// Get Korea timezone start/end of today
function getKoreaTodayRange() {
  const now = new Date();
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaTime = new Date(now.getTime() + koreaOffset);

  const startOfDay = new Date(koreaTime);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(koreaTime);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return {
    start: new Date(startOfDay.getTime() - koreaOffset),
    end: new Date(endOfDay.getTime() - koreaOffset)
  };
}

export async function GET() {
  try {
    // Check DB connection
    let dbConnected = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbConnected = false;
    }

    // Get today's range for counting today's contents
    const { start, end } = getKoreaTodayRange();

    const [totalContents, totalTags, todayCount, recentContents] = await Promise.all([
      prisma.contents.count(),
      prisma.tags.count(),
      prisma.contents.count({
        where: {
          created_at: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.contents.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          created_at: true,
        }
      })
    ]);

    const remainingToday = Math.max(0, DAILY_LIMIT - todayCount);

    return NextResponse.json({
      totalContents,
      totalTags,
      todayCount,
      remainingToday,
      dailyLimit: DAILY_LIMIT,
      recentContents,
      dbConnected
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
