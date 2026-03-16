# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
```

No test framework is configured yet.

## Environment Setup

Copy `.env.example` to `.env.local` and set:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

If unset, API calls fall back to relative path `/api/v1` (proxy-friendly).

## Architecture

**Next.js 16 App Router** with TypeScript and Tailwind CSS v4.

### Route Structure

- `/login`, `/signup` — public pages (no auth required)
- `/(auth)/*` — protected routes wrapped in `AuthGuard` + `MainLayout`
  - `/studies`, `/notices`, `/members/me`, `/members/[id]`
  - `/studies/[studyId]/curriculums/[curriculumId]`
  - `/posts/[postId]`, `/notices/[noticeId]`
  - `/admin/*` — admin-only routes wrapped in `AdminGuard`

### Auth Flow

- `AuthGuard` (`components/guards/AuthGuard.tsx`) calls `GET /api/v1/members/me` on every protected page load using React Query. On success, populates `useAuthStore`; on failure, redirects to `/login`.
- `AdminGuard` (`components/guards/AdminGuard.tsx`) checks `user.role === "ROLE_ADMIN"` from Zustand store; redirects non-admins to `/`.
- Token handling is cookie-based (HttpOnly). The axios client (`lib/api/client.ts`) auto-refreshes via `POST /api/v1/auth/refresh` on 401, queuing concurrent requests during refresh.

### State Management

- **Zustand** (`store/auth-store.ts`): holds `MemberInfo | null` for the logged-in user. `useIsAdmin()` is a convenience selector.
- **TanStack Query**: used for all server data fetching/caching. Wrapped in `QueryProvider`.

### API Layer

All API functions live in `lib/api/`. They use the shared `apiClient` (axios instance) from `lib/api/client.ts`. The helper `unwrapData<T>()` extracts `.data.data` from the common response envelope:

```json
{ "message": "...", "data": <T> }
```

Full API spec is at `docs/api/api.md`.

### Key Libraries

| Library | Purpose |
|---|---|
| `axios` | HTTP client with token-refresh interceptor |
| `@tanstack/react-query` | Server state / data fetching |
| `zustand` | Client state (auth user) |
| `react-hook-form` + `zod` | Form handling and validation |
| `react-markdown` | Markdown rendering in posts/notices |
