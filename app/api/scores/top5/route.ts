import { NextResponse } from 'next/server';
import { fetchTop5Records } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scores = await fetchTop5Records();
    return NextResponse.json(scores, { status: 200 });
  } catch (error) {
    console.error('Failed to get top 5 scores:', error);
    return NextResponse.json(
      { error: '실시간 랭킹을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
