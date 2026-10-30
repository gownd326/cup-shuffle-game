# 컵 섞기 야바위 게임 — 개발 문서

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

## 1. 프로젝트 개요 (한눈에 보기)

### 1. 프로젝트 목적
- 컵 아래 숨겨진 공을 찾는 전통적인 '야바위' 규칙을 웹 브라우저에서 즐길 수 있는 미니게임 제공.
- 컵이 이동하는 궤적을 눈으로 쫓을 수 있는 부드러운 애니메이션(`CSS Transform transition`)을 제공하여 조작감과 몰입감 극대화.
- 레벨이 올라갈수록 컵의 개수와 섞는 속도가 점진적으로 빨라져 도전 정신 자극.
- **전체 유저 온라인 실시간 랭킹 경쟁**: Neon PostgreSQL DB를 통해 모든 유저의 플레이 점수를 안전하게 기록하고, 실시간 **TOP 5 명예의 전당**을 제공.

### 2. 핵심 가치
- 별도의 로그인/회원가입 없이 즉시 플레이 가능 (닉네임만으로 점수 등록).
- **모든 컵 카드의 색상 및 디자인 100% 동일화**: 카드의 색상, 불투명도, 그림자, 테두리 스타일을 동일한 단일 화이트/크림톤(`bg-white opacity-100`)으로 통일하여 시각적 단서 없이 순수 궤적 추적으로만 공을 찾도록 구현.
- 온라인 리더보드를 통해 다른 사람들과의 점수 경쟁 재미 제공.

### 3. 주요 제약 사항
- Neon PostgreSQL 데이터베이스 및 Next.js 서버리스 API 라우트를 사용하여 DB 연결 정보(`DATABASE_URL`)를 클라이언트에 일체 노출하지 않음.
- 모바일 터치 및 PC 마우스 클릭 모두 지원하는 반응형 웹 디자인.

## 2. 사용자와 사용 시나리오

### 1. 타겟 유저
- 가볍게 웹 브라우저로 두뇌 회전 및 반사신경 게임을 즐기고 싶은 모든 연령층.

### 2. 유저 시나리오
1. **게임 시작 전**: 메인 화면에서 '게임 시작' 버튼을 누른다. 이 때 이전 최고 점수가 화면에 표시되어 있다.
2. **게임 진행**: 
   - 레벨 1: 컵 3개, 느린 속도로 섞기. 공이 들어간 컵을 확실히 보여준 뒤, 컵이 이동하는 궤적을 눈으로 볼 수 있도록 부드럽게 섞기 시작.
   - 섞기가 끝나고 유저는 컵 1개를 선택.
   - 맞추면 점수 획득 후 레벨 업, 틀리면 게임 오버.
3. **게임 종료**: 틀린 컵을 고르면 '게임 오버' 팝업과 함께 이번 게임의 최종 점수와 최고 점수 경신 여부가 표시된다. '다시 하기' 버튼으로 재시작 가능.

## 3. 기능 명세

### 1. 컵 카드 동일화 및 공(Ball) 가시성 규칙
- **컵 카드 시각 일관성 절대 규칙**
  - 모든 컵 카드는 단일한 디자인(`bg-white border-2 border-pink-200 rounded-2xl shadow-md`)을 공유하며, 인덱스나 위치에 따른 색상/패턴 차이가 전혀 없음.
  - 알파 블렌딩(반투명)을 배제한 100% 불투명 백색(`opacity: 1`, `#FFFFFF`)을 고정 적용하여 내부 그래픽 투과를 차단함.
- **공 노출 타이밍 규칙 (비침 및 유출 방지)**
  - `PREVIEW`: 시작 직후 정답 컵이 위로 들리며(`translateY(-50px)`) 1.5초간 공의 위치를 사용자에게 노출. 이때만 공의 `opacity: 1`, `visibility: visible`.
  - `MIXING` 및 `CHOOSING`: 컵이 완전히 내려온 순간부터 사용자가 컵을 고를 때까지 **공은 완전히 숨김 처리 (`display: none` 또는 `visibility: hidden`, `opacity: 0`)**. 카드가 100% 불투명하더라도 렌더링 레벨에서 공을 숨겨 잔상이나 비침 현상을 원천 차단함.
  - `REVEAL` / `ROUND_CLEAR` / `GAME_OVER`: 사용자가 컵을 선택한 후 컵이 열리는 순간에만 다시 공을 `visibility: visible`로 전환하여 정답 여부를 확인함.

### 2. 상태 정의 (`gameState`)
- `IDLE`: 게임 시작 대기 중 (상단에 '게임 시작' 버튼 및 '🏆 랭킹 보기' 버튼 노출, 공 비노출)
- `PREVIEW`: 시작 직후 공 위치 1.5초 노출
- `MIXING`: 두 컵의 슬롯 좌표를 순차 교환. 고유 DOM 요소의 `transform: translateX(...)` 유지. `pointer-events: none`.
- `CHOOSING`: 섞기 완료 후 컵 선택 대기 (`pointer-events: auto`)
- `REVEAL`: 선택 컵 열림(`translateY(-40px)`). 성공 시 `ROUND_CLEAR`, 실패 시 오답 및 정답 컵 동시 공개 후 `GAME_OVER`.
- `ROUND_CLEAR`: 정답 효과음 및 점수 누적, 1.2초 후 다음 레벨 자동 시작.
- `GAME_OVER`: 모달 표시, 최종 점수 확인 및 닉네임 등록 UI 제공.

### 3. 레벨 디자인 및 반응형 슬롯 계산 (모바일 겹침 방지)
모바일 화면 폭(가로 320px~420px)에서도 컵 카드가 서로 겹치거나 화면 밖으로 잘리지 않도록 컵 개수와 뷰포트 너비(`containerWidth`)에 맞춰 컵 가로폭(`cupWidth`)과 이동 간격(`slotWidth`)을 유동적으로 계산한다.

- **모바일 겹침 방지 계산식**: `slotWidth = Math.min(containerWidth / cupCount, maxSlotWidth)`
  - PC(화면폭 640px 이상): `maxSlotWidth = 100px`, 컵 크기 `w-20` (80px)
  - 모바일(화면폭 360px 이하 및 컵 5개인 Lv.5): `slotWidth = 60px`, 컵 크기 `w-14` (56px) 또는 `w-12` (48px)로 자동 축소되어 절대 겹치지 않고 화면 내 정렬됨.

| 레벨 | 컵 개수 | 교환 횟수 | 1회 이동시간(ms) | 대기(ms) | PC 슬롯(컵폭) | 모바일 슬롯(컵폭) | 모바일 안전 마진 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Lv.1 | 3개 | 4회 | 750ms | 250ms | 100px (80px) | 85px (70px) | 좌우 여백 각 25px 이상 확보 |
| Lv.2 | 3개 | 6회 | 650ms | 200ms | 100px (80px) | 85px (70px) | 좌우 여백 각 25px 이상 확보 |
| Lv.3 | 4개 | 7회 | 550ms | 150ms | 90px (74px) | 70px (58px) | 좌우 여백 각 20px 이상 확보 |
| Lv.4 | 4개 | 9회 | 480ms | 120ms | 90px (74px) | 70px (58px) | 좌우 여백 각 20px 이상 확보 |
| Lv.5+ | 5개 | 10회 | 420ms | 100ms | 80px (66px) | 58px (48px) | 320px 화면에서도 겹침 0px |

### 4. 온라인 점수 계산 및 실시간 랭킹보드(TOP 5) 시스템
- **점수 산출 공식**: 라운드 통과 시 획득 점수 = `(현재 레벨 × 100) + (잔여 컵 개수 × 50)`
- **점수 등록 절차 및 1회 제한 규칙**:
  1. 플레이어가 오답을 고르면 `GAME_OVER` 모달 발생 (`isScoreSaved = false`).
  2. 닉네임(2~8자) 입력 후 '기록 저장' 클릭 시 Next.js API(`POST /api/scores`)를 통해 Neon DB에 삽입.
  3. 저장이 완료되면 `isScoreSaved = true`가 되며 '기록 저장' 버튼이 비활성화(`disabled`, '저장 완료 ✓')되고 닉네임 필드도 `disabled` 처리.
  4. 다음 게임에서 다시 `GAME_OVER`가 될 때까지 중복 등록 불가.
  5. 상위 5개 레코드를 실시간 갱신하여 TOP 5 모달에 표시.

## 4. 화면과 주소(URL) 구성

### 1. 화면 구조 및 반응형 레이아웃
- **메인 컨테이너**: `min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 flex flex-col justify-between items-center p-3 sm:p-4 select-none overflow-x-hidden`
- **상단 헤더 (`Header.tsx`)**:
  - 타이틀: `도전! 컵 섞기 야바위 게임 🥤` (모바일 `text-lg font-bold`, PC `text-2xl font-extrabold`)
  - 상태 패널: `Score: {score}`, `Best: {best}`, `Lv.{level}`을 카드형 뱃지로 표시
  - 우측 액션: `🏆 랭킹 보기` 버튼
- **게임 영역 (`GameBoard.tsx`)**:
  - 안내 배너: 게임 상태에 따른 명확한 가이드 텍스트 노출 (`IDLE`, `PREVIEW`, `MIXING`, `CHOOSING`)
  - **컵 보드 컨테이너**:
    - `relative w-full max-w-[560px] h-[210px] sm:h-[240px] mx-auto flex justify-center items-end px-2 overflow-hidden`
    - 컵 레일: 컵 전체가 들어갈 수 있도록 `width: cupCount * slotWidth`로 동적 지정되며 화면 중앙 정렬됨.
    - **컵 카드 (`CupItem.tsx`)**:
      - **모든 카드가 완전히 동일한 100% 단일 화이트 색상 (`bg-white opacity-100`)**: 개별 컵마다 색상이나 스타일 변화를 전혀 주지 않음.
      - 테두리 및 그림자: `border-2 border-pink-200 shadow-md` 통일.
      - 크기: 모바일 해상도에 맞춰 크기가 동적으로 조절됨 (`w-[48px] h-[80px]` ~ `w-[76px] h-[110px]`)
      - `z-index: 20`: 컵 카드가 공 그래픽보다 항상 위에 위치
    - **공 컴포넌트 (`Ball.tsx`)**:
      - `absolute z-10 bottom-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 shadow-inner flex items-center justify-center`
      - `isRevealed` (PREVIEW 또는 REVEAL/종료 시점)일 때만 화면에 표시되며, `MIXING` 및 `CHOOSING` 상태에서는 `opacity-0 pointer-events-none hidden`으로 완전 은폐.
- **모달 레이어**:
  - **`GameOverModal.tsx`**: 게임 오버 알림, 최종 점수, 닉네임 입력(2~8자), 1회 저장 버튼, 다시 도전하기 버튼.
  - **`LeaderboardModal.tsx`**: TOP 5 랭킹 팝업 (순위, 닉네임, 점수, 달성일).

## 5. 데이터 모델

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

## 6. 디자인 가이드

### 1. 컬러 팔레트 및 불투명도 규칙
- 배경색 (파스텔 그라데이션): `bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100` (`#FCE7F3`, `#F3E8FF`, `#E0F2FE`)
- 모달/패널 배경: `bg-white/95 backdrop-blur-md border border-pink-100`
- **컵 카드 색상 (전체 동일한 100% 완전 불투명 화이트)**:
  - **적용 규칙**: 모든 컵 카드는 예외 없이 동일한 클래스를 공유한다 (`bg-white opacity-100 border-2 border-pink-200 shadow-md`).
  - **색상 통일**: 컵 번호나 슬롯에 따른 색상 분기, 그라데이션 차이, 반투명 효과를 절대 부여하지 않으며 순백색(`#FFFFFF`)과 핑크 테두리(`#FBCFE8`)로 완전히 동일하게 렌더링한다.
- 공 색상: 강렬한 붉은색 `bg-red-500` (`#EF4444`) 및 광택 하이라이트
- 메인 액션 버튼: `bg-pink-400 hover:bg-pink-500 active:scale-95 text-white font-bold` (`#F472B6`)
- 보조 버튼: `bg-purple-400 hover:bg-purple-500 text-white font-bold` (`#C084FC`)
- 비활성화 버튼: `bg-slate-300 text-slate-500 cursor-not-allowed`

### 2. 컴포넌트 스타일 및 모바일 반응형 규칙
- **모바일 겹침 방지 (No Overlap)**:
  - 컵 카드는 단일 가로 트랙 안에서 `translateX`로만 이동하며, 줄바꿈되지 않는다.
  - 좁은 스마트폰(320px~390px) 환경에서는 컵 5개 기준 컵 너비를 `w-12`(48px), 슬롯 간격을 58px로 줄여 컨테이너 가로폭 내에 여유 있게 배치한다.
  - 부모 기준점으로부터 `slotIndex * slotWidth`로 픽셀 좌표를 계산하여 컵끼리 겹치는 현상을 방지한다.
- **둥근 모서리 및 입체감**: `rounded-2xl`, 부드러운 핑크 그림자(`shadow-pink-200/50`).

## 7. 기술 스택과 폴더 구조

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

## 8. 품질 기준 (성능·보안·접근성)

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

## 9. 배포와 운영

### 1. 배포 파이프라인
- GitHub 저장소 푸시 → Vercel 자동 감지 및 빌드 배포
- 빌드 명령어: `npm run build`
- 출력 디렉토리: `dist`

## 10. 테스트 계획

### 1. 연기 테스트 (Smoke Test)
- `GET /`: 상태 코드 200 정상 로딩 확인
- 헤더 문구, 점수 배너, 게임 시작 버튼 표시 확인
- `GET /api/scores/top5`: 상태 코드 200 및 JSON 배열 응답 확인

### 2. 수용 기준 및 테스트 시나리오
- **시나리오 1: 카드 외관 동일성 및 공 비침 방지 검증**
  - **Given** 컵 3개 이상이 렌더링된 상태이다.
  - **When** 렌더링된 모든 컵 카드의 CSS 스타일(`backgroundColor`, `borderColor`, `opacity`)을 비교한다.
  - **Then** 모든 컵 카드가 오차 없이 동일한 `rgb(255, 255, 255)` 배경과 불투명도 1.0을 가지며, `MIXING` 및 `CHOOSING` 상태에서 공 요소는 화면상에 보이지 않아야 한다.

- **시나리오 2: 좁은 모바일 화면(320px~375px)에서 컵 카드 겹침/잘림 검증**
  - **Given** 뷰포트 너비를 360px로 설정하고 Lv.5(컵 5개) 게임을 실행한다.
  - **When** 5개의 컵 카드가 화면에 배치되고 서로 위치를 교환할 때 컵 요소들의 좌표(`getBoundingClientRect`)를 측정한다.
  - **Then** 인접한 두 컵 카드의 경계가 서로 겹치거나 화면 좌우 끝을 벗어나 잘리지 않고, 일정한 간격을 유지하며 화면 중앙에 온전히 노출되어야 한다.

- **시나리오 3: 공 노출 타이밍 검증**
  - **Given** 게임이 진행된다.
  - **When** 게임 상태가 변경된다.
  - **Then** 공은 오직 (1) 게임 시작 직후 `PREVIEW` 상태(1.5초)와 (2) 사용자가 카드를 클릭하여 열리는 `REVEAL`/`ROUND_CLEAR`/`GAME_OVER` 상태에서만 화면에 보여야 한다.

- **시나리오 4: 게임 오버 후 점수 1회 저장 검증**
  - **Given** 게임 종료 모달이 팝업된다.
  - **When** 닉네임을 입력하고 '기록 저장'을 누른다.
  - **Then** 저장이 완료되면 버튼 문구가 '저장 완료 ✓'로 바뀌며 즉시 비활성화(`disabled`)되고, 닉네임 입력란도 비활성화되어 중복 제출이 방지된다.

## 11. 가정과 기본값 (AI가 대신 정한 것)

| 항목 | 선택한 값 | 이유 | 바꾸려면 |
| --- | --- | --- | --- |
| 카드 외관 통일 | 모든 카드 동일한 순백색 (`bg-white opacity-100`) | 카드의 색상 차이로 인한 정답 유추를 방지하고 순수 궤적 추적 게임성을 유지하기 위함 | 필요 시 카드 뒷면에 동일한 패턴 그래픽 추가 가능 |
| 공 숨김 방식 | `MIXING` 및 `CHOOSING` 동안 `opacity: 0` 및 `visibility: hidden` | 컵 내부 투과 가능성을 원천 차단하고 선택 확인 시에만 노출하기 위함 | 필요 시 DOM 언마운트 방식으로 변경 가능 |
| 모바일 슬롯 계산 | `Math.min(containerWidth / cupCount, maxSlotWidth)` | 기기 해상도 및 컵 개수에 따라 가변 축소하여 모바일 겹침과 잘림을 동시 해결 | 고정 슬롯 + 가로 스크롤 방식으로 변경 가능 |
| 랭킹 저장소 | Neon PostgreSQL (`game_scores`) + Next.js API | 보안성 높은 서버 사이드 DB 연결 및 실시간 온라인 랭킹 제공 | 로컬 브라우저 저장소(`localStorage`)로 변경 가능 |

## 12. 아직 정해지지 않은 사항

모든 기능 사양과 디자인 규칙, 데이터 모델이 확정되었습니다. 미정 사항이 없습니다.

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
