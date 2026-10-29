# 컵 섞기 야바위 게임 — 기술·데이터 설계

> 문서 버전 v20 · 완성도 100% · 마지막 수정 2026. 10. 29. 14시 32분 54초
> 이 문서만 보고 AI(또는 개발자)가 개발해도 거의 같은 결과가 나오도록 작성되었습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 사이트 이름 | 컵 섞기 야바위 게임 |
| 영문 식별자(slug) | cup-shuffle-game |
| 개발 방식(framework) | vite |
| 데이터베이스 사용 | 예 (Supabase) |
| 배포 | GitHub → Vercel (무료) |

## 1. 데이터 모델

### 1. 데이터베이스 스키마 (Supabase PostgreSQL)
- **테이블명**: `game_scores`
- **컬럼 정의**:

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default: gen_random_uuid()` | 고유 식별자 |
| `nickname` | `text` | NOT NULL, `length(nickname) between 2 and 8` | 플레이어 닉네임 |
| `score` | `integer` | NOT NULL, `check: score >= 0` | 최종 획득 점수 |
| `level` | `integer` | NOT NULL, `default: 1` | 도달한 최종 레벨 |
| `created_at` | `timestamptz` | NOT NULL, `default: now()` | 점수 기록 일시 |

### 2. 행 수준 보안 (RLS: Row Level Security) 정책
- RLS 활성화: `ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;`
- **읽기 정책 (모든 유저 공개 조회)**:
  ```sql
  CREATE POLICY "Allow public read on game_scores"
  ON game_scores FOR SELECT
  USING (true);
  ```
- **쓰기 정책 (누구나 점수 등록 가능)**:
  ```sql
  CREATE POLICY "Allow public insert on game_scores"
  ON game_scores FOR INSERT
  WITH CHECK (true);
  ```

### 3. 순위 조회 쿼리
- TOP 5 조회: `SELECT * FROM game_scores ORDER BY score DESC, created_at ASC LIMIT 5;`
- 전체 최고 점수 조회: `SELECT score FROM game_scores ORDER BY score DESC LIMIT 1;`

## 2. 기술 스택과 폴더 구조

### 1. 기술 스택
- 프레임워크: Vite + React 18 (TypeScript)
- 백엔드 / 데이터베이스: Supabase (PostgreSQL, `@supabase/supabase-js` v2)
- 스타일링: Tailwind CSS (파스텔 테마 및 CSS Transform 애니메이션)
- 사운드: Web Audio API (외부 파일 로딩 의존성 없는 브라우저 내장 신디사이저 사운드)
- 아이콘: Lucide React (Trophy, RefreshCw, Star, Play 등)

### 2. 프로젝트 디렉토리 구조
```text
cup-shuffle-game/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   └── supabase.ts         # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    ├── types/
    │   └── game.ts             # GameState, CupItem, LevelConfig, ScoreRecord 타입
    ├── constants/
    │   └── levels.ts           # 레벨별 속도, 컵 개수, 섞기 횟수 테이블
    ├── utils/
    │   ├── sound.ts            # Web Audio API 톤 생성기 (정답, 오답, 컵 이동 사운드)
    │   └── timer.ts            # sleep 비동기 딜레이 헬퍼
    └── components/
        ├── Header.tsx           # 현재 점수, 최고 점수, 현재 레벨, 랭킹 보기 버튼
        ├── StatusAlert.tsx      # 현재 게임 상태 말풍선 UI
        ├── GameBoard.tsx        # 컵 슬롯 좌표 계산 및 translateX 애니메이션 제어
        ├── CupItem.tsx          # 100% 동일한 외관의 컵 카드 그래픽 컴포넌트
        ├── GameOverModal.tsx    # 점수 확인, 닉네임 등록, 1회 저장 제한 버튼, 재도전 액션
        └── LeaderboardModal.tsx # 실시간 Supabase TOP 5 리더보드 모달
```

### 3. 환경 변수
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL (예: `https://xxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Supabase 공개 익명 키 (Anon Key)

## 3. 품질 기준 (성능·보안·접근성)

### 1. 성능 및 애니메이션 안정성
- **눈으로 추적 가능한 컵 이동 궤적 보장**: DOM 요소를 React 렌더링으로 재마운트하지 않고, 각 컵 카드 요소에 고유 key(`cup.id`)를 부여한 상태에서 슬롯 인덱스에 따른 `transform: translateX(...)` 속성만을 변경. 브라우저의 리플로우(Reflow)를 유발하지 않고 GPU 가속 기반 60fps 부드러운 이동 궤적을 보장함.
- **중복 입력 및 조작 방지**: `MIXING` 및 `PREVIEW` 상태에서는 게임판 전체에 `pointer-events: none`을 강제 적용하여 섞는 도중 컵 터치를 원천 차단함.

### 2. 네트워크 및 Supabase 장애 대비 (폴백 메커니즘)
- Supabase 연결 실패 또는 네트워크 오류 발생 시 게임 플레이가 중단되지 않도록 로컬스토리지(`localStorage.getItem('cup_best_score')`)에 최고 점수를 자동 백업 저장.
- 랭킹 데이터 로딩 실패 시 에러 안내 문구("랭킹을 불러오지 못했습니다. 네트워크를 확인해주세요.")와 '다시 시도' 버튼을 표시.

### 3. 모바일/터치 접근성
- 컵 카드의 최소 터치 영역을 80px × 110px 이상 확보하여 스마트폰 터치 시 조작 실수를 방지.
- 가로 스크롤 방지(`overflow-x-hidden`) 및 모바일 세로 뷰에 맞춰 컵 간격 자동 축소(CSS Flex / Grid gap 조절).

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
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
