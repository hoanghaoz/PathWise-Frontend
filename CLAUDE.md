# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:3000/api
npm ci
npm run dev              # http://localhost:5173 (strictPort: fails if busy)
npm run build            # tsc -b && vite build
npm run lint             # eslint .
```

There is no test runner. CI (`.github/workflows/ci.yml`) runs `npm ci`, `lint`, `build` on Node 24. `VITE_*` vars are baked in at build time, so the Docker image must be rebuilt per environment.

The app needs the PathWise-BE backend on port 3000; its CORS only allows `http://localhost:5173`, which is why the dev port is pinned.

## Git workflow (enforced by hooks)

- Branches: `feature/`, `fix/`, `docs/`, `chore/` prefix; never push to `main` directly (PRs only; `develop` is the integration branch).
- Commits: Conventional Commits `<type>: <description>`, type in `feat|fix|docs|style|refactor|perf|test|chore`, description ≥ 10 chars (commitlint `commit-msg` hook).
- `pre-commit` runs lint-staged (eslint --fix + prettier).

## Architecture

React 19 + TypeScript (strict, `erasableSyntaxOnly`, `verbatimModuleSyntax` — use `import type`, no enums) + Vite + react-router-dom v7. UI copy is Vietnamese. Docs in `docs/` are also Vietnamese: `docs/auth-ui.md` (flows, screens) and `docs/color-palette.md` (tokens).

Provider order in `src/App.tsx`: `BrowserRouter` → `ToastProvider` → `AuthProvider` → `LearningProfileProvider` → `Routes`. All routes live in `App.tsx`; paths come from `src/shared/routes.ts` (`ROUTES`, `homePathFor(role)`). Screens whose backend API doesn't exist yet render `ComingSoonPage`; replace it in `App.tsx` when adding a real screen.

### Auth/session (spans several files)

- `services/tokenStorage.ts` keeps access/refresh tokens in `localStorage` — never render untrusted HTML.
- `services/api.ts` is the shared axios instance: attaches the Bearer token and, on a 401, refreshes **once** (parallel 401s share one in-flight refresh promise because the backend rotates refresh tokens, each usable once), then retries. If refresh fails it clears tokens and dispatches `pathwise:session-expired` on `window`. Auth endpoints are listed in `NO_REFRESH_PATHS`; add new no-token endpoints there.
- `contexts/AuthProvider.tsx` restores the session via `GET /auth/me` on load, listens for the session-expired event, and exposes `login/logout/changePassword` (context object in `auth-context.ts`, consumed via `useAuth`).
- Route guards: `RequireAuth role="USER"|"ADMIN"` (guest → `/login` with `state.from`; wrong role → own home) and `GuestOnly`. **Pages never navigate after login themselves** — `GuestOnly` redirects once `user` exists.
- New API screen pattern: `services/xxxService.ts` using `api`, errors through `shared/handleApiError.ts` (→ `NormalizedApiError` with `fieldErrors`) and `shared/apiErrorMessages.ts` `toUserMessage` (backend message → Vietnamese). Backend response envelope types are in `src/types/commonTypes`.
- Learner routes sit behind two guards: `RequireAuth role="USER"` then `RequireProfile`. A USER without a learning profile (`GET /learning-profile/me` → 404, held by `LearningProfileProvider`) is redirected to `/onboarding` (`OnboardingOnly`). Details in `docs/learning-profile.md`.
- `hooks/useLoad.ts` is the pattern for screen data fetching (keyed, with `retry`); `skillGraphService` serves both learner pickers and the admin graph editor.
- Forms use `hooks/useForm.ts` with rules from `shared/validators.ts` (mirror the backend DTOs).

### Styling (non-obvious)

- UI is built with the design system's own classes (`.btn`, `.field`, `.card`, `.page`, `.od-stack`…) from `src/styles/pathwise.css` (verbatim copy of the design's CSS — don't hand-edit) and `od-layout.css`. Tailwind v4 is loaded **without preflight** (`index.css`) and is only for small one-off tweaks; its `@theme` tokens mirror the CSS variables (Design Spec 2.1: navy `#13223F` primary, mint accent).
- Restyle only in `src/styles/pathwise-polish.css` (loaded after `pathwise.css`, which stays verbatim). Motion must sit inside `prefers-reduced-motion: no-preference`.
- Don't write ``className={`a${cond ? " b" : ""}`}`` — `prettier-plugin-tailwindcss` strips the space and glues classes together. Use `cx("a", cond && "b")` from `shared/cx.ts`.
- Mint `#5FCF9B` must not be used as text color on white (contrast 1.93).
