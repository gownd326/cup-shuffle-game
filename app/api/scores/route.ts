import { NextResponse } from 'next/server';
import { saveScore } from '@/lib/scores';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const { nickname, score, level } = body;

    // 검증: JSON 형식, 닉네임의 앞뒤 공백 제거 후 길이 2~8자, score 0 이상 정수, level 1 이상 정수
    if (typeof nickname !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 8) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (
      typeof score !== 'number' ||
      !Number.isInteger(score) ||
      score < 0 ||
      Number.isNaN(score)
    ) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (
      typeof level !== 'number' ||
      !Number.isInteger(level) ||
      level < 1 ||
      Number.isNaN(level)
    ) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const record = await saveScore(trimmed, score, level);
    return NextResponse.json(
      { success: true, record },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'INVALID_INPUT') {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }
    console.error('Failed to save score:', err);
    return NextResponse.json(
      { success: false, error: 'SAVE_FAILED' },
      { status: 503 }
    );
  }
}
