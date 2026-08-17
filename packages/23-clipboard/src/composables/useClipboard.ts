import { type ComputedRef, computed, ref } from 'vue'

export const COPY_ERROR = 'Could not copy.'
export const UNSUPPORTED = 'Clipboard is not available.'

export type ClipboardWriter = (text: string) => unknown

export interface ClipboardOptions {
  /** How long `copied` stays true, in ms. */
  timeout?: number
  /** Injected writer — defaults to the browser clipboard when there is one. */
  write?: unknown
}

export interface Clipboard {
  copied: ComputedRef<boolean>
  error: ComputedRef<string>
  isSupported: ComputedRef<boolean>
  /** Resolves to whether the text made it to the clipboard. */
  copy: (text: string) => Promise<boolean>
}

export function useClipboard(options: ClipboardOptions = {}): Clipboard {
  const { timeout = 2000, write } = options
  const copied = ref(false)
  const error = ref('')
  // biome-ignore lint/style/useConst: your implementation assigns the timer handle
  let timer: ReturnType<typeof setTimeout> | null = null

  // TODO: use the injected writer when there is one, otherwise the browser
  // clipboard — which is missing under SSR and on insecure origins.
  const writer: ClipboardWriter | null =
    typeof write === 'function' ? (write as ClipboardWriter) : null

  async function copy(text: string): Promise<boolean> {
    // TODO: refuse empty text and an unsupported environment, write otherwise,
    // then flash `copied` for `timeout` ms — a second copy restarts that window
    // instead of stacking a second timer.
    void text
    void writer
    void timer
    void timeout
    void error
    copied.value = true
    return true
  }

  // TODO: the pending timer must not outlive the scope.

  return {
    copied: computed(() => copied.value),
    error: computed(() => error.value),
    isSupported: computed(() => writer !== null),
    copy,
  }
}
