# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── english-platform/   # English Learning Platform (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## English Learning Platform

A full-featured English learning platform built with React + Vite.

### Features
- **Natural Voice Engine**: Uses `speechSynthesis` with preference for Google US English, Microsoft Aria, or any "Natural" voice. Pitch: 1.0, Rate: 0.9
- **20 High-Complexity Daily Tasks**: Grammar (Subjunctive, Passive Voice, Conditionals, Modals), Listening (6 comprehension questions), Speaking (pronunciation + discussion)
- **Vocabulary Flip Cards**: CSS 3D flip animation with `backface-visibility: hidden` and `transform-style: preserve-3d`
- **Progress System**: XP tracking, streak counter, daily accuracy percentage, time tracker (90 min goal)
- **Reset System**: Master Reset (clears all localStorage + reloads), Week Reset (current week XP/tasks), Undo per task
- **Adaptive Lock**: "Next Lesson" button locked until 90+ minutes studied AND >80% accuracy
- **Dark Mode**: Always-on dark purple theme with --ac: #7c6af7 (primary)
- **EnglishBay Backbone**: Videos sourced from EnglishBay playlist + 2 complementary AI-selected videos per day

### State Management
- All data stored in `localStorage` under key `english_platform_v2`
- No backend needed — fully client-side

### File Structure
```
artifacts/english-platform/src/
├── App.tsx                    # Root router
├── index.css                  # Dark purple theme, card flip CSS
├── lib/
│   ├── speechEngine.ts        # Natural voice TTS with priority matching
│   ├── store.ts               # localStorage state management
│   └── syllabus.ts            # Lesson/task/vocab data generation
├── hooks/
│   └── useAppState.ts         # React state hook wrapping store
├── components/
│   ├── ProgressHeader.tsx     # Sticky header with XP, streak, reset menu
│   ├── TaskCard.tsx           # MCQ/Speaking/Listening task cards with Undo
│   ├── VocabCard.tsx          # 3D flip vocabulary cards with TTS
│   └── VideoSection.tsx       # YouTube embed for EnglishBay + complementary
└── pages/
    └── Dashboard.tsx          # Main page with tabs
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
