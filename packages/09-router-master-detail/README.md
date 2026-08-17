# Exercise 09 — Router Master / Detail

**Time limit: 35 min** · Skills: Vue Router routes, dynamic params, `beforeEnter` guards, lazy routes, component reuse

## Prompt

Turn the starter router into a real master/detail flow in `src/router/index.ts`:

1. `/` redirects to the named route `users`.
2. `/users` lists users, each linking to `/users/:id`.
3. `/users/:id` renders the detail view, **lazily loaded** (`() => import(...)`).
4. A `beforeEnter` guard on the detail route redirects to `users` when the id is not a whole number or no such user exists.
5. A catch-all route (`/:pathMatch(.*)*`) renders `NotFoundView`, also lazily.

Then fix `UserDetailView.vue`. It currently reads `route.params.id` once — and that is the trap this exercise is built on.

## The trap

Navigating from `/users/1` to `/users/2` matches the **same route record**, so Vue Router reuses the component instance and `setup()` never runs again. Anything derived from `route.params` in plain code is frozen at the first value. Derive it with `computed` (or re-fetch with `watch`).

## DOM contract

| Selector                      | Meaning                                          |
| ----------------------------- | ------------------------------------------------ |
| `[data-testid="user-link"]`   | one `RouterLink` per user in the list             |
| `[data-testid="detail-name"]` | user name in the detail view                      |
| `[data-testid="detail-role"]` | user role in the detail view                      |
| `[data-testid="detail-bio"]`  | user bio in the detail view                       |
| `[data-testid="back"]`        | link back to the `users` route                    |
| `[data-testid="not-found"]`   | rendered by the catch-all route                   |

Route **names** matter: `users`, `user-detail`, `not-found`. The tests assert on them.

## Requirements

- `href` of the first user link is `/users/1` (build links with `:to="{ name, params }"`).
- `/users/999`, `/users/abc` and `/users/1.5` all land on the users list with no detail rendered.
- `routes` exports the detail route with a **function** component (that is how the test detects lazy loading).
- `createAppRouter(history?)` takes an injectable history so tests can pass `createMemoryHistory()` — never hard-code `createWebHistory()` inside the router instance you export.

## Hidden edge cases

Param-only navigation (component reuse), array-shaped params, a guard redirect firing before the lazy chunk resolves, and unknown top-level paths.

## Run

```bash
pnpm dev:09
pnpm --filter 09-router-master-detail test      # 11 tests, red until you implement
pnpm --filter 09-router-master-detail typecheck
```
