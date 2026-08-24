# Exercise 23 — Clipboard

**Time limit: 25 min** · Skills: feature detection, injected side effect, timed UI flash, `onScopeDispose`

> **Before you start:** read [Lesson 23 — APIs that might not be there](../../docs/lessons/23-clipboard.md).

## Prompt

```ts
useClipboard(options: { timeout?: number; write?: (text: string) => Promise<void> } = {}): {
  copied: ComputedRef<boolean>
  error: ComputedRef<string>
  isSupported: ComputedRef<boolean>
  copy(text: string): Promise<boolean>
}
```

## Requirements

- `copy(text)` writes through the injected `write`, or `navigator.clipboard.writeText` when none is given.
- After a successful copy, `copied` is true for `timeout` ms (2000 by default), then false again.
- Copying again **restarts** that window — the first timer must be cleared, or the second flash ends early.
- Empty or whitespace-only text is refused: no write, no flash, `copy` resolves `false`.
- A rejected write sets `error` to `COPY_ERROR` and leaves `copied` false. The next success clears it.
- No clipboard at all (SSR, insecure origin, old browser): `isSupported` is false and `copy` fails with `UNSUPPORTED` instead of throwing.
- The pending timer must not outlive the scope.
- `CopyButton.vue` shows `Copy` / `Copied!` and disables itself when the clipboard is unavailable.

## DOM contract

| Selector                 | Meaning                                            |
| ------------------------ | -------------------------------------------------- |
| `[data-testid="copy"]`   | the button; text is `Copy` or `Copied!`, disabled when unsupported |
| `[data-testid="error"]`  | present only after a failed copy                    |

## Hidden edge cases

Two copies inside one window (`vi.getTimerCount()` stays at 1), empty text, a rejected write, a `navigator` with no `clipboard`, and scope teardown.

## Run

```bash
pnpm dev:23
pnpm --filter 23-clipboard test
pnpm --filter 23-clipboard typecheck
```

Detect the feature (`navigator.clipboard?.writeText`), don't assume it — the same guard style as `window.localStorage` in exercise 12.
