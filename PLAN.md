# Finance Web - 뉴스 게시판 구현 계획

## Context

미국주식/코인 관련 정보를 서비스하는 웹 플랫폼의 첫 번째 기능으로 **뉴스 게시판**을 구축합니다. API 서버(`~/projects/finance-api-server`)는 NestJS 기반으로 이미 준비되어 있으며, 뉴스 관련 5개 REST 엔드포인트 + 1개 SSE 스트림을 제공합니다. `finance-web` 디렉토리는 현재 비어있어 프로젝트를 처음부터 셋업합니다.

향후 대시보드, 섹터 차트, 인사이트 게시판 등이 추가될 수 있으므로 **도메인(feature) 기반 디렉토리 구조**를 채택하여 확장성을 확보합니다.

## API 서버 엔드포인트 (이미 구현됨)

| 엔드포인트 | 기능 | 주요 파라미터 |
|-----------|------|-------------|
| `GET /api/v1/news` | 뉴스 목록 | limit, offset, source, category |
| `GET /api/v1/news/search` | 뉴스 검색 | q, limit, offset |
| `GET /api/v1/news/stats` | 통계 | - |
| `GET /api/v1/news/stream` | SSE 실시간 스트림 | source, category |
| `GET /api/v1/news/:newsId` | 뉴스 상세 | - |

응답 형식: `{ success: boolean, data: T, meta?: { total, limit, offset } }`

## 기술 스택

| 패키지 | 용도 |
|--------|------|
| Next.js 15 (App Router) | 프레임워크 |
| TypeScript | 타입 안전성 |
| Tailwind CSS + shadcn/ui | 스타일링 + UI 컴포넌트 |
| TanStack Query 5 | 서버 상태 관리, 캐싱, 무한스크롤 |
| nuqs | URL 쿼리 파라미터 ↔ 상태 동기화 |
| date-fns | 날짜 포맷 (한국어 로케일) |
| next-themes | 다크/라이트 모드 |
| Vitest + Testing Library + MSW | 단위/통합 테스트 |
| Playwright | E2E 테스트 |

## 디렉토리 구조

```
finance-web/
├── src/
│   ├── app/                           # Next.js App Router 페이지
│   │   ├── layout.tsx                 # 루트 레이아웃 (Providers, 네비게이션)
│   │   ├── page.tsx                   # 홈 → /news 리다이렉트
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── news/
│   │       ├── page.tsx               # 뉴스 목록 (필터+검색+무한스크롤)
│   │       └── [newsId]/
│   │           └── page.tsx           # 뉴스 상세
│   │
│   ├── features/                      # 도메인별 기능 모듈
│   │   └── news/
│   │       ├── api/
│   │       │   ├── news-api.ts        # API 호출 함수
│   │       │   └── news-queries.ts    # TanStack Query 훅
│   │       ├── components/
│   │       │   ├── news-list.tsx       # 뉴스 목록 (무한스크롤)
│   │       │   ├── news-card.tsx       # 뉴스 카드
│   │       │   ├── news-detail.tsx     # 뉴스 상세
│   │       │   ├── news-filter.tsx     # 소스/카테고리 필터
│   │       │   ├── news-search.tsx     # 검색바
│   │       │   ├── news-stats.tsx      # 통계 표시
│   │       │   ├── news-live-badge.tsx # SSE 실시간 알림 뱃지
│   │       │   └── news-skeleton.tsx   # 로딩 스켈레톤
│   │       ├── hooks/
│   │       │   ├── use-news-filters.ts # 필터 상태 (URL 동기화)
│   │       │   └── use-news-sse.ts     # SSE 연결 훅
│   │       └── types/
│   │           └── news.ts            # NewsDto, NewsQueryParams 등
│   │
│   ├── shared/                        # 공유 유틸리티/컴포넌트
│   │   ├── api/
│   │   │   └── api-client.ts          # 공통 fetch 래퍼
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── footer.tsx
│   │   │   ├── providers.tsx          # QueryClientProvider 등
│   │   │   └── theme-provider.tsx     # 다크/라이트 모드
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   └── use-intersection.ts    # 무한스크롤용
│   │   ├── lib/
│   │   │   ├── utils.ts              # cn() 등
│   │   │   └── format.ts             # 날짜/소스 포맷팅
│   │   └── types/
│   │       └── api.ts                # ApiResponse<T> 공통 타입
│   │
│   └── components/ui/                 # shadcn/ui 컴포넌트
│
└── tests/
    ├── setup.ts
    ├── mocks/                         # MSW 핸들러 + 픽스처
    ├── unit/
    ├── integration/
    └── e2e/
```

## 플랫폼 아키텍처

### 아키텍처 원칙

1. **Feature-Sliced 아키텍처** — 도메인 중심으로 코드를 분리하여 feature 간 의존성을 최소화
2. **Server-First, Client-When-Needed** — Server Component를 기본으로, 인터랙션이 필요한 곳만 Client Component
3. **단방향 의존성** — `app/ → features/ → shared/` 방향으로만 import 허용 (역방향 금지)
4. **계약 기반 API 레이어** — API 응답 타입을 엄격히 정의하고, 경계에서 검증

### 레이어 아키텍처

```
┌──────────────────────────────────────────────────────┐
│                    app/ (라우팅 레이어)                 │
│  페이지 라우트, 레이아웃, 에러 바운더리                   │
│  역할: 라우팅 + 컴포넌트 조합 (Server Component)        │
│  규칙: 비즈니스 로직 없음. features/의 컴포넌트를 조합만   │
├──────────────────────────────────────────────────────┤
│                 features/ (도메인 레이어)               │
│  도메인별 컴포넌트, 훅, API 함수, 타입                   │
│  역할: 특정 기능의 모든 로직을 캡슐화                     │
│  규칙: 다른 feature를 직접 import 하지 않음              │
│        shared/만 의존 가능                             │
├──────────────────────────────────────────────────────┤
│                  shared/ (공유 레이어)                  │
│  API 클라이언트, 유틸, 공용 훅, 레이아웃 컴포넌트          │
│  역할: feature에 독립적인 범용 코드                      │
│  규칙: feature/를 절대 import 하지 않음                  │
│        순수 유틸리티 성격만 포함                          │
├──────────────────────────────────────────────────────┤
│               components/ui/ (UI 프리미티브)            │
│  shadcn/ui 기반 디자인 시스템 컴포넌트                    │
│  역할: 도메인 무관한 순수 UI 빌딩 블록                    │
│  규칙: 비즈니스 로직 없음. props만으로 동작               │
└──────────────────────────────────────────────────────┘
```

**의존성 방향 (단방향 강제):**
```
app/ ──→ features/ ──→ shared/ ──→ components/ui/
  │                       │
  └───────────────────────┘  (app/도 shared/ 직접 사용 가능)
```

### Server Component vs Client Component 전략

```
                          Server Component (기본)
                         ┌──────────────────┐
                         │  app/layout.tsx   │ ← Providers 래핑만
                         │  app/news/page   │ ← prefetch + HydrationBoundary
                         │  app/news/[id]   │ ← prefetch + HydrationBoundary
                         └────────┬─────────┘
                                  │ props / children
                                  ▼
                          Client Component ('use client')
                         ┌──────────────────┐
                         │  news-list       │ ← useInfiniteQuery, 무한스크롤
                         │  news-filter     │ ← URL 상태 변경
                         │  news-search     │ ← 입력 + 디바운스
                         │  news-live-badge │ ← SSE EventSource
                         │  news-stats      │ ← useQuery
                         │  news-detail     │ ← useQuery
                         │  providers       │ ← QueryClientProvider
                         │  theme-provider  │ ← next-themes
                         │  header          │ ← 모바일 메뉴 토글
                         └──────────────────┘

순수 표시 전용 (어느 쪽이든 가능 — 부모에 따라 결정):
  news-card.tsx       ← 이벤트 핸들러 없으면 Server Component 가능
  news-skeleton.tsx   ← 순수 UI
  footer.tsx          ← 순수 UI
```

**판단 기준:**
- `useState`, `useEffect`, `useRef`, 이벤트 핸들러 → Client Component
- `useQuery`, `useMutation`, `useInfiniteQuery` → Client Component
- 단순 표시 (props → JSX) → Server Component 가능 (부모에 따라)
- API prefetch + HydrationBoundary → Server Component (page.tsx)

### 데이터 흐름 아키텍처

```
[1] 초기 로드 (SSR + Hydration)
──────────────────────────────────────────

  Server (page.tsx)                Client (news-list.tsx)
  ┌─────────────────┐            ┌─────────────────────┐
  │ QueryClient     │            │ useInfiniteQuery     │
  │ .prefetchQuery  │──dehydrate─→│ (hydration으로 즉시  │
  │ (news 1페이지)   │   state    │  캐시 히트, fetch 안함)│
  └────────┬────────┘            └──────────┬──────────┘
           │                                │
           │ fetch (서버→API)               │ 스크롤 → fetchNextPage
           ▼                                ▼
  ┌─────────────────┐            ┌─────────────────────┐
  │ API Server      │            │ API Server          │
  │ GET /api/v1/news│            │ GET /api/v1/news    │
  │ (offset=0)      │            │ (offset=20,40,...)  │
  └─────────────────┘            └─────────────────────┘


[2] SSE 실시간 업데이트
──────────────────────────────────────────

  Client (news-live-badge.tsx)     Client (news-list.tsx)
  ┌─────────────────────┐        ┌─────────────────────┐
  │ EventSource         │        │                     │
  │ /api/v1/news/stream │        │ useInfiniteQuery    │
  │                     │        │                     │
  │ onmessage:          │        │                     │
  │  newCount++         │        │                     │
  └──────────┬──────────┘        └──────────┬──────────┘
             │                               │
             │ 사용자가 "새 뉴스" 클릭          │
             └──────── invalidateQueries ────→│
                                              │
                                     자동 refetch
                                              │
                                              ▼
                                   ┌─────────────────┐
                                   │ 최신 뉴스 표시    │
                                   └─────────────────┘


[3] 필터/검색 상태 흐름
──────────────────────────────────────────

  URL (?source=finnhub&category=general&q=apple)
    │
    │  nuqs (URL ↔ State 동기화)
    ▼
  ┌──────────────────┐
  │ useNewsFilters() │ ← source, category, q 상태
  └──────┬───────────┘
         │
    ┌────┴────┐
    ▼         ▼
  news-      news-search
  filter       │
    │          │ (검색어 있으면)
    │          ▼
    │    useNewsSearchInfiniteQuery(q)
    │
    └──→ useNewsInfiniteQuery(source, category)
              │
              │ queryKey가 바뀌면 자동 refetch
              ▼
         API 호출 + 캐시 갱신
```

### Query Key 설계 (TanStack Query)

```typescript
// Query Key Factory 패턴 — 캐시 무효화와 의존성 관리를 체계화

const newsKeys = {
  all:      ['news'] as const,
  lists:    () => [...newsKeys.all, 'list'] as const,
  list:     (filters: NewsQueryParams) =>
              [...newsKeys.lists(), filters] as const,
  searches: () => [...newsKeys.all, 'search'] as const,
  search:   (params: SearchParams) =>
              [...newsKeys.searches(), params] as const,
  details:  () => [...newsKeys.all, 'detail'] as const,
  detail:   (newsId: string) =>
              [...newsKeys.details(), newsId] as const,
  stats:    () => [...newsKeys.all, 'stats'] as const,
}

// 활용 예시:
// queryClient.invalidateQueries({ queryKey: newsKeys.all })
//   → 모든 뉴스 관련 쿼리 무효화
// queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
//   → 목록 쿼리만 무효화 (상세/통계는 유지)
```

### Query 캐싱 전략

```
뉴스 목록  staleTime: 30초    gcTime: 5분
           → 30초간 캐시 사용, 이후 백그라운드 refetch
           → 필터 변경 시 queryKey가 달라져 새 쿼리 실행

뉴스 검색  staleTime: 30초    gcTime: 5분
           → 동일 검색어 재실행 시 즉시 캐시 반환

뉴스 상세  staleTime: 5분     gcTime: 30분
           → 뉴스 내용은 잘 안 바뀌므로 길게 캐싱
           → 뒤로가기 시 즉시 표시 (네트워크 재요청 없음)

뉴스 통계  staleTime: 60초    gcTime: 10분
           → 통계는 자주 안 바뀌므로 가장 길게 캐싱
```

### SSR Prefetch + Hydration 패턴

```
app/news/page.tsx (Server Component):

  ┌─────────────────────────────────────────┐
  │ 1. getQueryClient() (서버용 인스턴스)     │
  │ 2. queryClient.prefetchInfiniteQuery(   │
  │      newsKeys.list({...}),              │
  │      fetchNewsList                      │
  │    )                                     │
  │ 3. queryClient.prefetchQuery(           │
  │      newsKeys.stats(),                  │
  │      fetchNewsStats                     │
  │    )                                     │
  │ 4. <HydrationBoundary                   │
  │      state={dehydrate(queryClient)}>    │
  │      <NewsPageClient />                 │
  │    </HydrationBoundary>                 │
  └─────────────────────────────────────────┘

결과:
  - 첫 화면 로드 시 HTML에 뉴스 데이터가 포함됨 (SEO 유리)
  - 클라이언트에서 hydration 후 즉시 표시 (로딩 스피너 없음)
  - 이후 인터랙션(스크롤, 필터)은 클라이언트에서 처리
```

### API 클라이언트 아키텍처

```
┌──────────────────────────────────────────────────┐
│                shared/api/api-client.ts            │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ apiClient<T>(endpoint, options): ApiResponse│   │
│  │                                             │   │
│  │  - Base URL 주입 (env)                      │   │
│  │  - 응답 파싱 + 타입 캐스팅                    │   │
│  │  - 에러 표준화 (ApiClientError)              │   │
│  │  - 서버/클라이언트 양쪽에서 동작               │   │
│  └────────────────────────────────────────────┘   │
│                         │                          │
└─────────────────────────┼──────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ features/    │ │ features/    │ │ features/    │
  │ news/api/    │ │ dashboard/   │ │ sectors/     │
  │ news-api.ts  │ │ api/         │ │ api/         │
  │              │ │ (향후)        │ │ (향후)        │
  │ fetchNews()  │ │              │ │              │
  │ searchNews() │ │              │ │              │
  └──────┬───────┘ └──────────────┘ └──────────────┘
         │
         ▼
  ┌──────────────┐
  │ features/    │
  │ news/api/    │
  │ news-queries │
  │ .ts          │
  │              │
  │ useNews...() │ ← TanStack Query 훅
  └──────────────┘

각 레이어의 역할:
  api-client.ts   : HTTP 전송 (fetch 래퍼), 에러 처리, 타입 안전성
  news-api.ts     : 뉴스 도메인 특화 API 함수 (엔드포인트 + 파라미터 매핑)
  news-queries.ts : React 훅 레이어 (캐싱, 무한스크롤, 상태 관리)
```

### 에러 처리 아키텍처

```
┌─ 에러 발생 지점 ─────────────────── 처리 방식 ──────────────────┐
│                                                                 │
│ [API 네트워크 에러]                                               │
│   api-client.ts                                                 │
│   └→ ApiClientError throw                                       │
│       └→ TanStack Query onError                                 │
│           └→ 컴포넌트에서 error 상태 렌더링                        │
│               └→ "뉴스를 불러올 수 없습니다" + 재시도 버튼           │
│                                                                 │
│ [API 4xx 에러] (400 Bad Request, 404 Not Found)                 │
│   api-client.ts                                                 │
│   └→ ApiClientError { code, message, status }                   │
│       └→ 404: 뉴스 상세 → not-found 컴포넌트                     │
│       └→ 400: 유효하지 않은 파라미터 → 필터 초기화                  │
│                                                                 │
│ [렌더링 에러]                                                     │
│   app/error.tsx (Error Boundary)                                │
│   └→ 전역 에러 UI + "다시 시도" 버튼                               │
│                                                                 │
│ [404 라우트]                                                     │
│   app/not-found.tsx                                             │
│   └→ 404 페이지 UI                                               │
│                                                                 │
│ [SSE 연결 에러]                                                   │
│   use-news-sse.ts                                               │
│   └→ EventSource onerror                                        │
│       └→ isConnected: false + 자동 재연결 (지수 백오프)            │
│       └→ UI: 연결 상태 표시 (🔴 → ⚫)                            │
└─────────────────────────────────────────────────────────────────┘
```

### SSE 연결 관리 아키텍처

```
┌── useNewsSse 훅 내부 상태 머신 ──────────────────────┐
│                                                       │
│   DISCONNECTED ──(mount)──→ CONNECTING                │
│        ▲                        │                     │
│        │                    onopen                     │
│     (unmount                    │                     │
│      또는                       ▼                     │
│      필터변경)            CONNECTED                    │
│        │                   │      │                   │
│        │              onmessage  onerror              │
│        │                   │      │                   │
│        │                   ▼      ▼                   │
│        │             카운트증가  RECONNECTING           │
│        │                         │                    │
│        │                    지수 백오프 대기             │
│        │                    (1s → 2s → 4s → max 30s)  │
│        │                         │                    │
│        │                         ▼                    │
│        └─────────────── CONNECTING (재연결)             │
│                                                       │
│  maxRetries: 10 초과 시 → DISCONNECTED (수동 재연결)    │
└───────────────────────────────────────────────────────┘

필터 변경 시:
  1. 기존 EventSource.close()
  2. 카운트 리셋
  3. 새 필터로 EventSource 재생성
```

### 향후 확장 아키텍처 (Feature 추가 시)

```
현재 (뉴스 게시판):
  src/features/
    └── news/          ← 독립적 모듈

향후 확장:
  src/features/
    ├── news/          ← 뉴스 게시판
    ├── dashboard/     ← 대시보드 (시세, 지표)
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   └── types/
    ├── sectors/       ← 섹터 자금 흐름
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   └── types/
    └── insights/      ← 인사이트 게시판
        ├── api/
        ├── components/
        ├── hooks/
        └── types/

Feature 간 통신이 필요한 경우:
  → shared/에 공유 타입/훅을 두고 간접 참조
  예: 뉴스 카드에서 종목 심볼 클릭 → /dashboard?symbol=AAPL
      → URL 파라미터로 전달 (컴포넌트 간 직접 의존 없음)
```

### 번들 최적화 전략

```
[코드 스플리팅]
  Next.js App Router 자동 분할:
    /news        → news 페이지 청크
    /news/[id]   → 상세 페이지 청크
    /dashboard   → (향후) 별도 청크

[동적 import]
  무거운 컴포넌트만 선별적으로:
    - 향후 차트 라이브러리 (recharts 등)
    - 마크다운 렌더러 (인사이트 게시판)

[트리 셰이킹]
  - date-fns: 필요한 함수만 import (import { formatDistanceToNow } from 'date-fns')
  - lucide-react: 개별 아이콘 import (import { Search } from 'lucide-react')

[폰트 최적화]
  - next/font로 Pretendard 로컬 로드 (FOUT 방지)
  - display: swap (초기 렌더링 차단 방지)
```

### 환경 설정 아키텍처

```
┌── 환경별 설정 ──────────────────────────────┐
│                                              │
│  .env.local (개발)                           │
│    NEXT_PUBLIC_API_URL=http://localhost:3000  │
│                                              │
│  .env.production (배포)                      │
│    NEXT_PUBLIC_API_URL=https://api.finance.io │
│                                              │
│  src/shared/config/env.ts                    │
│    export const config = {                   │
│      apiUrl: process.env.NEXT_PUBLIC_API_URL │
│              ?? 'http://localhost:3000',      │
│      isDev: process.env.NODE_ENV             │
│             === 'development',               │
│    }                                         │
│                                              │
│  → 환경변수를 한 곳에서 관리 + 타입 안전성      │
│  → 직접 process.env 접근 대신 config 객체 사용  │
└──────────────────────────────────────────────┘
```

## 디자인 시스템

### 디자인 컨셉: "Clean Terminal"

Bloomberg Terminal의 정보 밀도와 현대 핀테크의 깔끔한 미니멀리즘을 결합합니다. 금융 플랫폼의 핵심 가치인 **신뢰감, 가독성, 정보 밀도**를 유지하면서, 과하지 않은 모던한 느낌을 줍니다.

**디자인 원칙:**
1. **정보 우선** — 장식적 요소 최소화, 데이터가 주인공
2. **차분한 신뢰감** — 화려한 색상 대신 절제된 팔레트로 전문성 전달
3. **스캔 가능한 레이아웃** — 시선의 흐름을 고려한 계층 구조
4. **실시간 감각** — 라이브 데이터를 체감할 수 있는 미세한 애니메이션

### 컬러 시스템

```
[다크 모드 — 기본]
Background:     #0A0A0F (거의 검정에 가까운 남색)
Surface:        #12121A (카드, 패널 배경)
Surface Hover:  #1A1A25
Border:         #1E1E2A (미세한 경계선)
Text Primary:   #E8E8ED
Text Secondary: #8B8B9E
Text Muted:     #52526B

[라이트 모드]
Background:     #F8F8FC
Surface:        #FFFFFF
Surface Hover:  #F0F0F6
Border:         #E4E4ED
Text Primary:   #111118
Text Secondary: #5C5C72
Text Muted:     #9898AC

[시멘틱 컬러 — 공통]
Accent Blue:    #3B82F6 (주요 액션, 링크)
Positive:       #22C55E (상승, 성공)
Negative:       #EF4444 (하락, 에러)
Warning:        #F59E0B (주의)
Info:           #06B6D4 (정보성)

[소스별 컬러]
Finnhub:        #3B82F6 (블루)
SEC:            #8B5CF6 (퍼플)
FRED:           #F59E0B (앰버)
RSS:            #06B6D4 (시안)

[카테고리별 컬러]
기업뉴스:       #3B82F6
일반:           #6B7280
실적:           #22C55E
시장:           #F59E0B
```

### 타이포그래피

```
폰트 패밀리:
  본문:   Pretendard (한글 최적화, 가독성 우수)
  숫자:   Pretendard (고정폭 숫자 지원 — tabular-nums)
  코드:   JetBrains Mono (향후 데이터 테이블 등에 활용)

폰트 크기 스케일:
  xs:   12px / 1.5  — 메타 정보 (발행시간, 소스)
  sm:   14px / 1.5  — 보조 텍스트 (요약, 필터 라벨)
  base: 16px / 1.6  — 본문 (뉴스 요약 내용)
  lg:   18px / 1.5  — 카드 제목
  xl:   20px / 1.4  — 섹션 제목
  2xl:  24px / 1.3  — 페이지 제목
  3xl:  30px / 1.2  — 상세 페이지 헤드라인

폰트 굵기:
  Regular (400):   본문, 요약
  Medium (500):    카드 제목, 라벨
  Semibold (600):  페이지 제목, 강조
  Bold (700):      헤드라인 (상세 페이지)
```

### 간격(Spacing) 시스템

```
Tailwind 기본 스케일 사용 (4px 단위):
  컴포넌트 내부 패딩:  p-3 (12px) ~ p-5 (20px)
  카드 간 간격:        gap-4 (16px)
  섹션 간 간격:        space-y-6 (24px) ~ space-y-8 (32px)
  페이지 좌우 여백:    px-4 (모바일) / px-6 (태블릿) / px-8 (데스크톱)
  최대 콘텐츠 너비:    max-w-7xl (1280px)
```

### 레이아웃 설계

```
┌─────────────────────────────────────────────────┐
│  Header (h-14, 고정)                              │
│  [로고]          [뉴스 | 대시보드 | ...]  [🌙 | 🔍]│
├─────────────────────────────────────────────────┤
│                                                   │
│  Page Content (max-w-7xl, 중앙 정렬)              │
│                                                   │
│  ┌─ 뉴스 목록 페이지 (/news) ──────────────────┐ │
│  │                                               │ │
│  │  [검색바 ─────────────────────── 🔍]         │ │
│  │                                               │ │
│  │  [전체] [기업뉴스] [일반] [실적] [시장]       │ │
│  │                            소스: [▾ 전체]    │ │
│  │                                               │ │
│  │  ┌──── 통계 카드 ────────────────────────┐   │ │
│  │  │ 📰 전체 350  │ Finnhub 120 │ SEC 85  │   │ │
│  │  └──────────────────────────────────────┘   │ │
│  │                                               │ │
│  │  ┌─ 🔴 Live ─ 3개의 새 뉴스 클릭하여 보기 ─┐│ │
│  │                                               │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │ │
│  │  │ 뉴스카드 │ │ 뉴스카드 │ │ 뉴스카드 │        │ │
│  │  │         │ │         │ │         │        │ │
│  │  └─────────┘ └─────────┘ └─────────┘        │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │ │
│  │  │ 뉴스카드 │ │ 뉴스카드 │ │ 뉴스카드 │        │ │
│  │  └─────────┘ └─────────┘ └─────────┘        │ │
│  │                                               │ │
│  │         ● (무한스크롤 로딩)                   │ │
│  └───────────────────────────────────────────┘ │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 반응형 브레이크포인트

```
모바일  (< 768px):   1열 카드, 햄버거 메뉴, 검색 아이콘 → 펼침
태블릿  (768-1024):  2열 카드 그리드, 상단 네비게이션
데스크톱 (> 1024):    3열 카드 그리드, 전체 네비게이션
와이드  (> 1440):    max-w-7xl 중앙 정렬, 양쪽 여백 자연 확장
```

### 컴포넌트별 상세 디자인

#### Header (h-14)
```
┌─────────────────────────────────────────┐
│ ◆ Finance   [뉴스]  [대시보드]   🌙  🔍 │
└─────────────────────────────────────────┘
- 배경: surface + backdrop-blur (스크롤 시 반투명)
- 고정 위치 (sticky top-0)
- 현재 페이지 네비게이션 항목: accent blue 밑줄
- 모바일: 로고 + 햄버거(Sheet) + 테마 토글
```

#### 뉴스 카드 (news-card)
```
┌─────────────────────────────────┐
│ Finnhub  기업뉴스     3시간 전   │  ← 소스뱃지(컬러) + 카테고리 + 시간
│                                 │
│ Apple Reports Record Q4         │  ← 제목 (font-medium, 2줄 clamp)
│ Revenue of $94.9 Billion        │
│                                 │
│ Apple announced quarterly...    │  ← 요약 (text-secondary, 2줄 clamp)
│ revenue that exceeded...        │
│                                 │
│ AAPL  NASDAQ  +2.3%            │  ← 심볼 태그 (작은 뱃지)
└─────────────────────────────────┘
- 배경: surface
- 테두리: border (1px)
- Hover: surface-hover + 미세한 translate-y(-1px) + shadow 증가
- 전환: transition-all duration-200
- 카드 전체가 클릭 영역 (Next Link)
- 소스 뱃지: 각 소스별 고유 색상의 작은 dot + 텍스트
```

#### 뉴스 필터 (news-filter)
```
카테고리: 탭 형태 (shadcn Tabs)
┌────────────────────────────────────────────┐
│ [전체] [기업뉴스] [일반] [실적] [시장]       │
└────────────────────────────────────────────┘
- 활성 탭: accent blue 배경 (rounded-full pill 스타일)
- 비활성: ghost 스타일

소스: Select 드롭다운
┌──────────────┐
│ 소스: 전체  ▾ │
└──────────────┘
- 오른쪽 정렬
- 선택 시 해당 소스 컬러 dot 표시
```

#### 검색바 (news-search)
```
┌─ 🔍 ──────────────────────── ✕ ─┐
│   뉴스 검색...                    │
└──────────────────────────────────┘
- 배경: surface
- 포커스: accent blue 링(ring) + border 하이라이트
- 입력 중: 우측에 X 클리어 버튼 표시
- 디바운스 300ms 후 자동 검색
- 모바일: 아이콘 클릭 시 전체 너비로 확장 (애니메이션)
```

#### 실시간 알림 뱃지 (news-live-badge)
```
┌─ 🔴 Live ── 3개의 새 뉴스 ── 클릭하여 보기 ─┐
└──────────────────────────────────────────────┘
- 새 뉴스 있을 때만 표시 (animate-in: slide-down + fade)
- 🔴 점: pulse 애니메이션 (연결 상태 표시)
- 클릭 시: 목록 갱신 + 스크롤 최상단 + 뱃지 사라짐
- 배경: accent blue 반투명 (bg-blue-500/10)
- 연결 끊김 시: 🔴 → ⚫ 회색 + "연결 중..." 텍스트
```

#### 통계 카드 (news-stats)
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📰 전체   │ │ 🔵 Finnhub│ │ 🟣 SEC   │ │ 🟡 FRED  │
│   350    │ │   120    │ │    85    │ │    78    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
- 가로 스크롤 (모바일) 또는 4열 그리드 (데스크톱)
- 각 소스별 고유 컬러 아이콘
- 숫자: tabular-nums, font-semibold
- hover 시 해당 소스 필터 적용 (인터랙티브)
```

#### 뉴스 상세 페이지 (/news/[newsId])
```
┌─────────────────────────────────────────┐
│ ← 뒤로가기                               │
│                                           │
│ Finnhub · 기업뉴스 · 2024.01.15 14:30   │  ← 메타 정보
│                                           │
│ Apple Reports Record Q4                  │  ← 헤드라인 (3xl, bold)
│ Revenue of $94.9 Billion                 │
│                                           │
│ ─────────────────────────────────────── │  ← separator
│                                           │
│ Apple today announced financial results  │  ← 요약 본문 (base, 넉넉한 line-height)
│ for its fiscal 2024 fourth quarter...    │
│                                           │
│ [AAPL] [NASDAQ] [TECH]                   │  ← 심볼 뱃지
│                                           │
│ ┌──────────────────────┐                 │
│ │ 🔗 원문 보기          │                 │  ← 외부 링크 버튼
│ └──────────────────────┘                 │
└─────────────────────────────────────────┘
- 최대 너비: max-w-3xl (읽기에 최적화된 좁은 폭)
- 메타 정보: text-secondary, 소스별 컬러 dot
- 헤드라인 ~ 요약 사이 separator
- 원문 보기: outline 버튼 + 외부 링크 아이콘
```

#### 로딩 스켈레톤 (news-skeleton)
```
┌─────────────────────────────────┐
│ ░░░░░░  ░░░░░░░░     ░░░░░░░  │  ← 뱃지 + 시간 스켈레톤
│                                 │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← 제목 스켈레톤
│ ░░░░░░░░░░░░░░░░░░░           │
│                                 │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← 요약 스켈레톤
│ ░░░░░░░░░░░░░░░░░░            │
│                                 │
│ ░░░░  ░░░░░░                   │  ← 심볼 스켈레톤
└─────────────────────────────────┘
- shimmer 애니메이션 (animate-pulse)
- 실제 카드와 동일한 크기/구조
```

#### 빈 상태 / 에러 상태
```
빈 상태:
┌─────────────────────────────────┐
│                                  │
│        📭                        │
│   검색 결과가 없습니다            │
│   다른 키워드로 검색해보세요      │
│                                  │
└──────────────────────────────────┘

에러 상태:
┌─────────────────────────────────┐
│                                  │
│        ⚠️                        │
│   뉴스를 불러올 수 없습니다       │
│   [다시 시도]                    │
│                                  │
└──────────────────────────────────┘
- 중앙 정렬, 충분한 여백
- 에러: 재시도 버튼 제공
```

### 애니메이션 & 트랜지션

```
카드 호버:        transform: translateY(-2px), shadow 증가 (200ms ease)
카드 등장:        fade-in + slide-up (stagger 50ms씩, 최초 로드 시)
새 뉴스 뱃지:     slide-down + fade-in (300ms)
필터 전환:        목록 fade-out → fade-in (150ms)
페이지 전환:      Next.js App Router 기본 (즉각)
스켈레톤:         pulse 애니메이션 (Tailwind animate-pulse)
SSE 연결 점:      pulse 애니메이션 (1.5s 주기)
```

### 접근성(a11y) 가이드라인

```
- 모든 인터랙티브 요소에 키보드 접근 가능 (Tab, Enter, Escape)
- 뉴스 카드: role="article", 제목에 적절한 heading 레벨
- 필터: aria-label, aria-selected
- 검색: role="search", aria-label
- 실시간 알림: aria-live="polite" (스크린 리더에 새 뉴스 알림)
- 색상 대비: WCAG AA 기준 충족 (4.5:1 이상)
- 소스/카테고리 구분: 색상 + 텍스트 (색맹 대응)
- 포커스 링: accent blue 2px ring (outline-none ring-2 ring-blue-500)
```

## 구현 단계

### Phase 1: 프로젝트 초기화 + 공통 인프라

1. **Next.js 프로젝트 생성** — `pnpm create next-app@latest`로 초기화 (TypeScript, Tailwind, App Router, src 디렉토리)
2. **의존성 설치** — TanStack Query, nuqs, date-fns, next-themes 등
3. **shadcn/ui 초기화** — button, card, badge, input, select, skeleton, sheet, tabs 등 추가
4. **환경 설정** — `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:3000`)
5. **테스트 환경 설정** — Vitest, Playwright, MSW 구성
6. **공통 타입 정의** — `src/shared/types/api.ts` (ApiResponse, ApiError 등)
7. **API 클라이언트** — `src/shared/api/api-client.ts` (fetch 래퍼, 에러 핸들링)
8. **유틸리티** — cn(), formatRelativeDate(), formatNewsSource()
9. **공용 훅** — useDebounce, useIntersection
10. **Providers** — QueryClientProvider 래퍼
11. **레이아웃 컴포넌트** — Header(반응형 네비게이션), Sidebar, Footer
12. **루트 레이아웃** — Providers 래핑, 한국어 폰트 설정

### Phase 2: 뉴스 목록 + 상세

13. **뉴스 타입** — `src/features/news/types/news.ts` (NewsDto, NewsQueryParams, NewsStats)
14. **뉴스 API 함수** — fetchNewsList, fetchNewsDetail, searchNews, fetchNewsStats
15. **TanStack Query 훅** — useNewsInfiniteQuery (무한스크롤), useNewsDetailQuery, useNewsStatsQuery
16. **뉴스 카드** — 헤드라인, 소스/카테고리 뱃지, 발행시간(상대시간), 심볼 태그, 요약(2줄)
17. **뉴스 목록** — 무한스크롤(IntersectionObserver), 로딩 스켈레톤, 빈 상태
18. **뉴스 상세** — 전체 정보 표시, 원문 링크, 뒤로가기
19. **페이지 라우트** — `/news`, `/news/[newsId]`, `/` (→ /news 리다이렉트)

### Phase 3: 필터 + 검색

20. **필터 상태 훅** — nuqs로 URL 쿼리 동기화 (source, category, q)
21. **필터 UI** — 소스 드롭다운 (전체/Finnhub/SEC/FRED/RSS), 카테고리 탭 (전체/기업뉴스/일반/실적/시장)
22. **검색바** — 디바운스(300ms) 적용, 검색/일반 모드 전환
23. **검색 Query 훅** — useNewsSearchInfiniteQuery

### Phase 4: SSE 실시간 알림 + 통계

24. **SSE 훅** — EventSource로 `/api/v1/news/stream` 연결, 새 뉴스 카운트, 자동 재연결
25. **실시간 알림 뱃지** — "N개의 새 뉴스" 버튼 (클릭 시 목록 갱신), 연결 상태 표시
26. **뉴스 통계** — 소스별/카테고리별 뉴스 수 카드

### Phase 5: 마무리

27. **다크/라이트 모드** — next-themes, 시스템 설정 기본값
28. **반응형 최적화** — 모바일(1열), 태블릿(2열), 데스크톱(3열)
29. **에러/404 페이지**
30. **SEO 메타데이터** — generateMetadata

### Phase 6: 테스트

31. **단위 테스트** — api-client, news-api, 유틸, 훅 (Vitest + MSW)
32. **통합 테스트** — 뉴스 목록/상세/필터/검색 컴포넌트 (Testing Library + MSW)
33. **E2E 테스트** — 뉴스 게시판 전체 흐름, 검색 (Playwright)

## 주요 설계 결정

### 상태 관리 전략
| 상태 유형 | 도구 | 설명 |
|----------|------|------|
| 서버 상태 | TanStack Query | 뉴스 데이터 캐싱, 무한스크롤 |
| URL 상태 | nuqs | 필터/검색 파라미터 → URL 동기화 (공유/북마크 가능) |
| 실시간 상태 | useNewsSse 커스텀 훅 | SSE 연결, 새 뉴스 카운트 |
| UI 상태 | React useState | 사이드바 열림/닫힘 등 |

별도 글로벌 상태 라이브러리(Zustand 등)는 현 단계에서 불필요.

### SSE 연동 방식
- 브라우저에서 API 서버로 직접 EventSource 연결 (Next.js API Route 프록시 불필요)
- 새 뉴스 수신 시 카운트만 증가 → 사용자가 "새 뉴스" 뱃지 클릭 시 queryClient.invalidateQueries로 목록 갱신
- 필터 변경 시 기존 연결 닫고 새 연결 생성

### 무한스크롤
- TanStack Query의 `useInfiniteQuery` + IntersectionObserver
- `getNextPageParam`: `meta.offset + meta.limit < meta.total`이면 다음 offset 반환

## 위험 요소

| 위험 | 대응 |
|------|------|
| Tailwind CSS 4 + shadcn/ui 호환성 | 최신 shadcn/ui는 Tailwind 4 지원. 문제 시 Tailwind 3으로 폴백 |
| SSE 연결 안정성 | 자동 재연결 + 연결 상태 UI 표시 |
| 무한스크롤 성능 (대량 데이터) | 필요 시 react-virtual 도입 |

## 검증 방법

1. `pnpm dev`로 개발 서버 기동 후 `/news` 페이지 정상 로드 확인
2. API 서버(`finance-api-server`)와 연동하여 실제 뉴스 데이터 표시 확인
3. 무한스크롤, 필터, 검색, 상세 페이지 이동 수동 테스트
4. SSE 스트림 연결 후 실시간 알림 수신 확인
5. 모바일/데스크톱 반응형 레이아웃 확인
6. `pnpm test` — 단위 + 통합 테스트 통과 (커버리지 80%+)
7. `pnpm test:e2e` — E2E 테스트 통과
8. `pnpm build` — TypeScript 빌드 에러 없음
