import { NextResponse } from 'next/server';
import { insertScoreRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nickname, score, level } = body;

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: '닉네임은 2~8자 사이여야 합니다.' },
        { status: 400 }
      );
    }
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 8) {
      return NextResponse.json(
        { error: '닉네임은 2~8자 사이여야 합니다.' },
        { status: 400 }
      );
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || !Number.isInteger(numScore)) {
      return NextResponse.json(
        { error: '유효한 점수가 아닙니다.' },
        { status: 400 }
      );
    }

    const numLevel = Number(level) || 1;

    const record = await insertScoreRecord(trimmed, numScore, numLevel);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '점수 등록에 실패했습니다.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
