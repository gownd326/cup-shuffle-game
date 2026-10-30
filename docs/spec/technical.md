# 컵 섞기 야바위 게임 — 기술·데이터 설계

> 문서 버전 v24 · 완성도 100% · 마지막 수정 2026. 10. 30. 9시 16분 51초
> 이 문서만 보고 AI(또는 개발자)가 개발해도 거의 같은 결과가 나오도록 작성되었습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 사이트 이름 | 컵 섞기 야바위 게임 |
| 영문 식별자(slug) | cup-shuffle-game |
| 개발 방식(framework) | nextjs |
| 데이터베이스 사용 | 예 (Neon PostgreSQL) |
| 배포 | GitHub → Vercel (무료) |

## 1. 데이터 모델

### 1. 데이터베이스 스키마 (Neon PostgreSQL)
- **테이블명**: `game_scores`
- **컬럼 정의**:

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | 고유 식별자 |
| `nickname` | `VARCHAR(8)` | NOT NULL, CHECK (char_length(nickname) >= 2) | 플레이어 닉네임 (2~8자) |
| `score` | `INTEGER` | NOT NULL, CHECK (score >= 0) | 최종 획득 점수 |
| `level` | `INTEGER` | NOT NULL DEFAULT 1 | 도달한 최종 레벨 |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | 점수 기록 일시 |

- **테이블 생성 DDL**:
```sql
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(8) NOT NULL CHECK (char_length(nickname) >= 2),
  score INTEGER NOT NULL CHECK (score >= 0),
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_game_scores_ranking ON game_scores (score DESC, created_at ASC);
```

### 2. 서버 API 엔드포인트
- `GET /api/scores/top5`:
  - 상위 5개 레코드 반환 (`SELECT nickname, score, level, created_at FROM game_scores ORDER BY score DESC, created_at ASC LIMIT 5;`)
- `POST /api/scores`:
  - 바디: `{ nickname: string, score: number, level: number }`
  - 서버 유효성 검사: 닉네임 길이(2~8자), score 0 이상 정수 확인 후 DB INSERT.
  - 응답: `{ success: true, record: { id, nickname, score, level } }`

## 2. 기술 스택과 폴더 구조

### 1. 기술 스택
- 프레임워크: Next.js (App Router, React 18, TypeScript)
- 스타일링: Tailwind CSS
- 데이터베이스: Neon PostgreSQL (`@neondatabase/serverless` 드라이버 사용)
- 오디오: Web Audio API (`AudioContext` 기반 브라우저 내장 오실레이터 비프음/클릭음 구현)
- 아이콘: Lucide React (`Trophy`, `Play`, `RotateCcw`, `Check`, `Award`)

### 2. 프로젝트 디렉토리 및 파일 트리
```text
cup-shuffle-game/
├── app/
│   ├── layout.tsx              # 전역 폰트 및 메타데이터
│   ├── page.tsx                # 메인 게임 단일 페이지
│   └── api/
│       └── scores/
│           ├── route.ts        # POST: 점수 저장 처리
│           └── top5/
│               └── route.ts    # GET: 상위 5명 점수 조회
├── components/
│   ├── Header.tsx              # 점수판, 최고점수, 레벨 및 랭킹 모달 버튼
│   ├── StatusAlert.tsx         # 상황별 안내 말풍선
│   ├── GameBoard.tsx           # 컵 슬롯 좌표 계산 및 translateX 애니메이션 제어
│   ├── CupItem.tsx             # 모든 컵에 동일한 외관을 적용하는 카드 컴포넌트
│   ├── Ball.tsx                # 붉은색 공 컴포넌트 (표시/은폐 제어)
│   ├── GameOverModal.tsx       # 점수 저장(1회 제한) 및 재도전 모달
│   └── LeaderboardModal.tsx    # 실시간 TOP 5 리더보드 모달
├── lib/
│   └── db.ts                   # Neon serverless pool/sql 클라이언트 인스턴스
├── types/
│   └── game.ts                 # GameState, CupItemType, LevelConfig, ScoreRecord 타입 정의
├── constants/
│   └── levels.ts               # 레벨별 속도(duration), 컵 개수(cupCount), 교환 횟수(shuffleCount)
├── utils/
│   ├── sound.ts                # Web Audio API 톤 생성기 (정답 징글, 실패 톤, 이동음)
│   └── timer.ts                # 비동기 딜레이 sleep 유틸리티
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3. 환경 변수 설정
- 서버 전용 환경 변수 (`.env.local`):
  - `DATABASE_URL`: Neon PostgreSQL 연결 문자열 (클라이언트에 노출되지 않음)

## 3. 품질 기준 (성능·보안·접근성)

### 1. 공 은폐 및 투과 방지 품질 기준
- **시각적 비침 차단**: 컵 카드의 배경색을 알파 채널이 없는 완전한 불투명 백색(`bg-white`, `#FFFFFF`)으로 설정하고, `MIXING` 및 `CHOOSING` 상태에서는 공 요소를 DOM에서 가상으로 숨기거나 `opacity: 0; visibility: hidden;` 처리하여 어떠한 환경(고대비 모니터, OLED 디스플레이)에서도 공의 위치가 투과되어 보이지 않도록 함.
- **렌더링 순서 (z-index) 보장**: 컵 카드(`z-index: 20`) > 공(`z-index: 10`) > 배경 레일(`z-index: 0`).

### 2. 크로스 디바이스 반응형 및 겹침 방지 품질 기준
- **최소 지원 해상도**: 모바일 가로 320px(iPhone SE 등 구형 기기)부터 PC 와이드 모니터까지 지원.
- **오버플로우 및 잘림 방지**: 보드 컨테이너에 `overflow-x-hidden` 및 동적 슬롯 계산(`slotWidth * cupCount <= containerWidth`)을 강제하여 가로 스크롤 발생이나 컵 요소의 잘림을 방지함.
- **이동 궤적 보장**: 60fps 부드러운 이동을 위해 CSS `transform: translateX(...)` 및 `transition: transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` 유지.

### 3. 상태 안전성
- 섞는 도중(`MIXING`) 터치 및 클릭 차단 (`pointer-events: none`).
- 점수 등록은 게임당 1회로 한정되며, 저장 직후 버튼 및 인풋이 즉시 비활성화됨.

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v24 | 2026. 10. 30. 9시 11분 33초 | 최종 감수: Next.js App Router와 Neon PostgreSQL 기반으로 아키텍처를 정렬하고, 모든 컵 카드의 색상 동일화(단일 화이트) 및 공 비침 차단 규칙을 완벽히 동기화하여 개발 준비를 마쳤습니다. |
| v23 | 2026. 10. 30. 8시 51분 41초 | 모바일 화면 컵 카드 겹침/잘림 방지를 위한 동적 반응형 슬롯 계산 적용 및 카드 100% 완전 불투명화와 공 노출 시점 제어 명시 |
| v22 | 2026. 10. 29. 17시 0분 16초 | 최종 감수: 최종 감수 완료: 컵 카드 동일 색상 및 애니메이션 궤적 보장, Supabase 랭킹 중복 저장 방지, 모바일/PC 반응형 레이아웃 일관성 검증 및 개발 착수 준비 완료 |
| v21 | 2026. 10. 29. 16시 8분 19초 | 업데이트: 컵 카드 색상 일관화 및 PC·모바일에서 자연스러운 레이아웃 반영 |
| v20 | 2026. 10. 29. 14시 14분 48초 | 최종 감수: 최종 감수 완료: 컵 카드 동일 색상 스타일, 섞기 애니메이션 궤적 보장, 점수 기록 저장 버튼 1회 비활성화 규칙, Supabase 연동 스펙 및 테스트 시나리오를 최종 확정했습니다. |
| v19 | 2026. 10. 29. 14시 10분 39초 | 게임 종료 후 점수 기록 저장이 완료되면 '기록 저장' 버튼이 비활성화(disabled)되고 다음 게임 종료 시까지 재제출을 차단하도록 기능/화면/테스트 명세 반영 |
| v18 | 2026. 10. 29. 13시 41분 21초 | 최종 감수: 최종 개발을 위해 컵 이동 애니메이션 기술 명세(슬롯 기반 좌표 전환)와 에러 대응 품질 기준을 보강하고 개발 착수 상태로 전환했습니다. |
| v17 | 2026. 10. 29. 13시 39분 51초 | 온라인 실시간 랭킹 시스템을 위한 Supabase DB 연동 규격 및 게임 오버 시 닉네임 등록 플로우 반영 |
| v16 | 2026. 10. 29. 13시 26분 17초 | 플레이어 닉네임 입력 및 TOP 5 리더보드(명예의 전당) 기록·경쟁 기능 요구사항 반영 |
| v15 | 2026. 10. 29. 13시 11분 25초 | 최종 감수: 최종 개발 착수를 위한 전체 문서 감수 완료 (제목 및 컵 카드 통일성 정합성 일치, 테스트 및 아키텍처 완성도 100% 검증) |
| v14 | 2026. 10. 29. 13시 7분 29초 | 야바위 게임 특성에 맞춰 모든 컵 카드의 배경색 및 외관 스타일을 완벽히 동일한 단일 색상으로 통일 |
| v13 | 2026. 10. 29. 12시 53분 56초 | 최종 감수: 컵 섞기 애니메이션이 브라우저에서 확실하게 보이도록 DOM 배치 및 CSS 트랜지션 타이밍 규칙을 극대화하고 개발 시작 가능한 최종 감수 완료 |
| v12 | 2026. 10. 29. 12시 52분 46초 | 컵이 섞이는 과정이 눈으로 명확히 보이도록 절대 좌표 슬라이딩 및 곡선 교차 애니메이션 구현 명세를 상세화했습니다. |
| v11 | 2026. 10. 29. 12시 40분 33초 | 최종 감수: 디자인을 아기자기하고 귀여운 파스텔톤 스타일로 전면 개편하고, 컵 섞기 야바위 게임의 모든 기능 명세, 화면 레이아웃, 데이터 및 테스트 시나리오를 최종 감수하여 완성했습니다. |
| v10 | 2026. 10. 29. 12시 40분 25초 | 야바위 게임의 디자인을 아기자기하고 귀여운 스타일(파스텔톤 배경, 둥근 모서리, 귀여운 폰트 및 이모지/애니메이션 감성)으로 전면 개편합니다. |
| v9 | 2026. 10. 29. 12시 37분 18초 | 컵이 멈춰있던 문제를 해결하기 위해 React 상태와 절대 좌표(translateX) 기반의 컵 이동 애니메이션 로직을 전면 재구축하고, 시각적 추적 과정을 명확히 보완함. |
| v8 | 2026. 10. 27. 15시 50분 18초 | 최종 감수: 컵 이동 애니메이션이 보이지 않는 문제를 해결하기 위해 CSS transform 기반의 스왑 애니메이션 및 타이밍 규칙을 기능 명세, 화면 명세, 테스트 계획에 구체적으로 보강하였습니다. |
| v7 | 2026. 10. 27. 15시 50분 13초 | 컵이 이동하는 궤적과 애니메이션이 확실히 보이도록 CSS transform과 swap 순서 로직을 구체화하고 관련 문서 내용을 보강했습니다. |
| v6 | 2026. 10. 27. 15시 48분 58초 | 최종 감수: 컵 이동 애니메이션(시각화) 기능을 상세히 반영하여 개발 문서 최종 감수 완료. |
| v5 | 2026. 10. 27. 15시 48분 51초 | 컵 섞기 과정에서 유저가 컵의 이동 경로를 시각적으로 명확히 추적할 수 있도록 섞기 속도와 애니메이션 트랜지션 명세를 구체화하고 보강함. |
| v4 | 2026. 10. 27. 15시 43분 28초 | 최종 감수: 컵 이동 애니메이션 상세 규칙 구체화 및 전반적인 기술 문서 최종 감수 완료 |
| v3 | 2026. 10. 27. 15시 43분 24초 | 컵 섞기 과정에서 컵들이 서로 자리를 바꾸는 애니메이션(시각적 이동 효과) 로직 및 명세 추가 |
| v2 | 2026. 10. 27. 15시 39분 7초 | 최종 감수: 최종 감수 완료: 모든 섹션 구체화, 수용 기준 및 테스트 시나리오 확정, 미정 사항 반영 |
| v1 | 2026. 10. 27. 15시 36분 30초 | 야바위 웹게임 프로젝트 초안 작성 (개요, 기능, 화면, 디자인 등 12개 섹션 구성) |
