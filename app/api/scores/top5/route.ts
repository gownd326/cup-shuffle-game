import { NextResponse } from 'next/server';
import { getTop5Scores } from '@/lib/scores';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await getTop5Scores();
    return NextResponse.json({ records }, { status: 200 });
  } catch (err) {
    console.error('Failed to fetch top 5 records:', err);
    return NextResponse.json(
      { success: false, error: 'LEADERBOARD_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
