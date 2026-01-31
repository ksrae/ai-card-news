import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DAILY_LIMIT = 3;

// Get Korea timezone start/end of today
function getKoreaTodayRange() {
  const now = new Date();
  // Korea is UTC+9
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaTime = new Date(now.getTime() + koreaOffset);

  // Start of day in Korea
  const startOfDay = new Date(koreaTime);
  startOfDay.setUTCHours(0, 0, 0, 0);

  // End of day in Korea
  const endOfDay = new Date(koreaTime);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Convert back to UTC
  return {
    start: new Date(startOfDay.getTime() - koreaOffset),
    end: new Date(endOfDay.getTime() - koreaOffset)
  };
}

export async function GET() {
  try {
    const { start, end } = getKoreaTodayRange();

    const todayCount = await prisma.contents.count({
      where: {
        created_at: {
          gte: start,
          lte: end
        }
      }
    });

    return NextResponse.json({
      count: todayCount,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - todayCount),
      canCreate: todayCount < DAILY_LIMIT
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to check limit" }, { status: 500 });
  }
}
