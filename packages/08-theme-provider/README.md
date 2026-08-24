# Exercise 08 — Theme Provider (provide/inject + plugin)

**Time limit: 30 min** · Skills: `provide`/`inject`, typed `InjectionKey`, Vue plugins, app-level state

> **Before you start:** read [Lesson 08 — Passing data down without props](../../docs/lessons/08-theme-provider.md).

## Prompt

Implement `src/theme/index.ts` and wire the three components to it.

```ts
createThemeApi(initial?: Theme): ThemeApi   // the state + actions, no Vue app needed
createTheme(initial?: Theme): Plugin        // a plugin whose install() provides the api
useTheme(): ThemeApi                        // inject it, or throw a helpful error
themeKey: InjectionKey<ThemeApi>            // typed key: inject() returns ThemeApi
```

`ThemeApi` exposes `theme` and `isDark` as **read-only** `ComputedRef`s plus `toggle()` and `set(theme)`. Consumers never write to `theme` directly.

Then:

- **`ThemeToggle.vue`** — a toggle button, a "force dark" button (`set('dark')`) and the current theme as text.
- **`ThemedPanel.vue`** — a `theme-light` / `theme-dark` class, `:data-dark="isDark"`, the theme as text, and it renders `DeepLabel`.
- **`DeepLabel.vue`** (already written) injects the theme three levels below the plugin.

## DOM contract

| Selector                        | Meaning                                     |
| ------------------------------- | ------------------------------------------- |
| `[data-testid="toggle"]`        | flips light ↔ dark                           |
| `[data-testid="force-dark"]`    | calls `set('dark')`                          |
| `[data-testid="toggle-theme"]`  | current theme text in ThemeToggle            |
| `[data-testid="panel"]`         | has class `theme-<theme>` and `data-dark`     |
| `[data-testid="panel-theme"]`   | current theme text in ThemedPanel            |
| `[data-testid="deep-theme"]`    | current theme text in DeepLabel              |

## Why it is built this way

- **`app.provide` in a plugin, not `provide()` in a component.** The state belongs to the app, so every component reaches it at any depth without prop drilling.
- **Typed `InjectionKey<ThemeApi>`.** With a plain string key, `inject()` returns `unknown` and you lose every type.
- **Read-only out, actions in.** Handing consumers a writable `ref` means any component can silently corrupt shared state.
- **Throw when the plugin is missing.** `inject()` returning `undefined` is a wiring bug — surfacing it beats a silent default. The test asserts the message mentions the theme plugin.
- **No module-level state.** Two apps must have independent themes; the tests mount two and toggle only one.

## Run

Unlike the other starters, this one **throws on mount** until `createThemeApi()` and `useTheme()` exist — the whole app depends on the injected api. Drive this exercise from the tests first, then open the browser.

```bash
pnpm dev:08
pnpm --filter 08-theme-provider test      # 11 tests
pnpm --filter 08-theme-provider typecheck
```
