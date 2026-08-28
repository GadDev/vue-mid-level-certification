# Exercise 25 — Auth Store & Route Guards

**Time limit: 40 min** · Skills: Pinia + Vue Router together, global `beforeEach`, route meta, redirect round-trip

> **Before you start:** read [Lesson 25 — The store knows who; the router decides where](../../docs/lessons/25-pinia-auth-guard.md).

## What you're building

A login flow where visiting a protected page while signed out redirects you to log in first, then sends you back to the page you originally wanted — and admin-only pages stay off-limits to everyone else.

## Prompt

An auth store and a router that protects routes with it.

```ts
useAuthStore(): { user, loading, error, isAuthenticated, isAdmin, login(email, password), logout() }
createAppRouter(history?: RouterHistory): Router
```

Routes: `/login` (`guestOnly`), `/dashboard` (`requiresAuth`), `/admin` (`requiresAuth`, `role: 'admin'`), `/` → dashboard.

## Requirements

**Store**

- `login` flips `loading` while the request runs and resolves to a boolean.
- Success stores the user and clears `error`; failure clears the **user** too and exposes the API's message — a failed login must never leave the previous session standing.
- `isAdmin` is true only for the `admin` role. `logout()` clears user and error.

**Guard** — one global `beforeEach` covering three rules:

1. `requiresAuth` without a session → `login`, with `query.redirect` set to the requested `fullPath`.
2. `role: 'admin'` reached by a non-admin → `dashboard`.
3. `guestOnly` reached by a signed-in user → `dashboard`.

**Views**

- `LoginView` signs in, then navigates to `query.redirect` (which can be `string | string[]`) or the dashboard. It shows the store error, and nothing before the first attempt.
- Signing out of the dashboard also **leaves** the page — the guard only runs on navigation.

## DOM contract

| Selector                                 | Meaning                     |
| ---------------------------------------- | --------------------------- |
| `[data-testid="login"]`                  | the login `<form>`           |
| `[data-testid="email"]` / `[data-testid="password"]` | credentials fields |
| `[data-testid="error"]`                  | present only after a failed attempt |
| `[data-testid="dashboard"]` / `[data-testid="admin"]` | the protected views |
| `[data-testid="who"]`                    | the signed-in email          |
| `[data-testid="logout"]`                 | signs out and navigates away |

## Hidden edge cases

The redirect round-trip (`/admin` → login → back to `/admin`), a member trying `/admin`, a signed-in user opening `/login`, a failed login after a successful one, and sign-out from a protected page.

## Run

```bash
pnpm dev:25
pnpm --filter 25-pinia-auth-guard test
pnpm --filter 25-pinia-auth-guard typecheck
```

Call `useAuthStore()` **inside** the guard. At module scope there is no active pinia yet, and you would capture the wrong instance in tests.
