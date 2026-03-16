# Study Frontend

스터디 그룹 관리 플랫폼의 프론트엔드입니다. 스터디 생성/참여, 커리큘럼 관리, 게시글 작성, AI 기반 퀴즈 등의 기능을 제공합니다.

## Tech Stack

| 분류 | 기술 |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Form | React Hook Form + Zod |
| HTTP | Axios |
| Markdown | react-markdown + remark-gfm |

## 시작하기

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에서 API 서버 주소를 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

설정하지 않으면 `/api/v1`로 요청합니다 (프록시 환경에 적합).

### 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 빌드

```bash
npm run build
npm run start
```

### 린트

```bash
npm run lint
```

## 주요 기능

- **인증** — 로그인/회원가입, JWT 쿠키 기반 인증, 토큰 자동 갱신
- **스터디** — 목록 조회, 상세 보기, 가입 신청 (BACKEND / ALGORITHM / COMPUTER_SCIENCE)
- **커리큘럼** — 커리큘럼별 게시글 목록 및 순서 관리
- **게시글** — 마크다운 에디터, 로컬 이미지 드래그 업로드, 외부 URL 삽입
- **퀴즈** — AI 자동 생성, 문제/선택지 셔플, 응시 결과 저장
- **공지사항** — 전체 공지 목록 및 상세 보기
- **알림** — 헤더 드롭다운, SSE 실시간 수신
- **관리자** — 스터디/커리큘럼/게시글/공지사항 CRUD, 퀴즈 응시 현황 조회

## 프로젝트 구조

```
app/
├── (auth)/          # 인증 필요 페이지 (AuthGuard)
│   ├── studies/     # 스터디 목록/상세/커리큘럼/게시글/퀴즈
│   ├── notices/     # 공지사항
│   ├── notifications/ # 알림 전체 보기
│   ├── members/     # 회원 정보
│   └── admin/       # 관리자 전용 (AdminGuard)
├── login/
└── signup/
components/
├── forms/           # 폼 컴포넌트 (Study, Curriculum, Post, Notice)
├── guards/          # AuthGuard, AdminGuard
├── layout/          # Header, MainLayout
└── ui/              # 공통 UI (ConfirmModal, MarkdownContent 등)
lib/
├── api/             # API 함수 모음 (axios 기반)
└── types/           # TypeScript 타입 정의
store/
└── auth-store.ts    # Zustand 인증 상태
```
