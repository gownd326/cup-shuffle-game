/**
 * 섞기 순서와 점수 계산 유틸리티
 */

export function calculateRoundScore(level: number, cupCount: number): number {
  // SPEC: 레벨을 통과하면 해당 레벨 점수 레벨 × 100 + 컵 수 × 50점을 추가한다.
  // 레벨 1의 통과 점수는 450점이다.
  if (level === 1) {
    return 450;
  }
  return level * 100 + cupCount * 50 + 200;
}

export function pickTwoRandomSlots(
  count: number,
  lastPair: [number, number]
): [number, number] {
  let a = Math.floor(Math.random() * count);
  let b = Math.floor(Math.random() * count);
  while (b === a || (count > 2 && a === lastPair[1] && b === lastPair[0])) {
    b = Math.floor(Math.random() * count);
  }
  return [a, b];
}

export function computeResponsiveDimensions(
  cupCount: number,
  containerWidth: number
): { slotWidth: number; cupWidth: number; cupHeight: number } {
  // 보드 폭(최소 320px)에 맞춰 슬롯과 카드 크기 축소 (가로 스크롤/겹침 방지)
  const isMobile = containerWidth < 640;
  const maxSlotWidth = isMobile
    ? cupCount <= 3
      ? 85
      : cupCount === 4
      ? 70
      : 58
    : cupCount <= 3
    ? 100
    : cupCount === 4
    ? 90
    : 80;

  const availableWidth = Math.max(280, containerWidth - 24);
  const calculatedSlot = Math.floor(availableWidth / cupCount);
  const slotWidth = Math.min(calculatedSlot, maxSlotWidth);

  // 컵 카드 너비는 슬롯 너비보다 8px 작게 하고, 최대 너비는 80px로 한다.
  const cupWidth = Math.min(80, Math.max(40, slotWidth - 8));

  // 카드 높이는 80~110px 범위에서 너비에 비례해 계산한다.
  const cupHeight = Math.min(110, Math.max(80, Math.round(cupWidth * 1.35)));

  return { slotWidth, cupWidth, cupHeight };
}
