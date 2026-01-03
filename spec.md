# Ultra‑Minimal Mandarat Spec (CLI Only)

> 목적: **토큰 최소화 + CLI 자동 구현 전용**
> 결과물: **한국인 사용자가 실제로 사용하는 서비스**
> UI/문구/UX는 최종 결과에서 반드시 **한국어로 제공**한다.

---

## STACK

* Frontend: Next.js (App Router), TypeScript, Tailwind
* State: Zustand
* Backend: Supabase (Auth + PostgreSQL + RLS)
* App: Expo (React Native)
* Image Export: html-to-image

---

## CORE RULES

* Mandarat = fixed 3x3 grid
* Center cell = main goal
* Each cell: editable, daily completion
* One completion per cell per day
* Progress = accumulated color

---

## COLOR LOGIC

* completed_count = 0 → gray
* 1–3 → light
* 4–7 → medium
* 8+ → strong
* Center color = avg of 8 cells

---

## DATA MODEL (Supabase)

### mandarats

```sql
id uuid PK
auth.users(id) FK
title text
created_at timestamptz
updated_at timestamptz
```

### mandarat_cells

```sql
id uuid PK
mandarat_id uuid FK
position int (0–8)
title text
memo text
completed_count int
last_completed_date date
unique(mandarat_id, position)
```

### mandarat_completions

```sql
id uuid PK
mandarat_cell_id uuid FK
user_id uuid FK
completed_date date
unique(mandarat_cell_id, completed_date)
```

---

## STATE

* Guest: LocalStorage
* Login: Supabase
* On login: migrate local → supabase (supabase wins)

---

## FEATURES

* Inline edit cells
* Daily complete button
* Today summary
* PNG export (1:1)

---

## CLI / CODEX PROMPT (COPY & RUN)

```
You are a senior full‑stack developer.

Build a Mandarat goal app using this spec.

Requirements:
- Next.js App Router + TypeScript
- Tailwind + Zustand
- Supabase Auth + PostgreSQL + RLS
- 3x3 Mandarat grid
- Inline editable cells
- One completion per cell per day
- Accumulated color progress
- LocalStorage for guests, Supabase for logged‑in users
- PNG export via html-to-image

Important:
- Final UI text must be in Korean
- Target users are Korean users
- Do not add features beyond this spec
```

---

> This document is intentionally minimal.
> Use it only for CLI / agent‑based code generation.

