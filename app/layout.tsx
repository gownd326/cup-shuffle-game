import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '도전! 컵 섞기 야바위 게임 🥤',
  description: '컵 아래 숨겨진 공을 찾는 전통적인 야바위 미니게임 & 실시간 TOP 5 랭킹 경쟁',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-pink-200 text-slate-700">
        {children}
      </body>
    </html>
  );
}
