import { type ComputedRef, computed, onScopeDispose, ref } from 'vue'

export const COPY_ERROR = 'Could not copy.'
export const UNSUPPORTED = 'Clipboard is not available.'

export interface ClipboardOptions {
  /** How long `copied` stays true, in ms. */
  timeout?: number
  /** Injected writer — defaults to the browser clipboard when there is one. */
  write?: (text: string) => Promise<void>
}

export interface Clipboard {
  copied: ComputedRef<boolean>
  error: ComputedRef<string>
  isSupported: ComputedRef<boolean>
  /** Resolves to whether the text made it to the clipboard. */
  copy: (text: string) => Promise<boolean>
}

function browserWriter(): ((text: string) => Promise<void>) | null {
  // Missing under SSR, in older browsers, and on insecure origins — so this is
  // a feature check, not a "modern browser" assumption.
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return null
  return text => navigator.clipboard.writeText(text)
}

export function useClipboard(options: ClipboardOptions = {}): Clipboard {
  const { timeout = 2000, write } = options
  const copied = ref(false)
  const error = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  const writer = write ?? browserWriter()

  function clearTimer(): void {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  async function copy(text: string): Promise<boolean> {
    if (text.trim() === '') return false
    if (!writer) {
      error.value = UNSUPPORTED
      return false
    }

    try {
      await writer(text)
    } catch {
      error.value = COPY_ERROR
      copied.value = false
      return false
    }

    error.value = ''
    copied.value = true
    // Restart the window: without clearing, an earlier timer ends the flash early.
    clearTimer()
    timer = setTimeout(() => {
      copied.value = false
      timer = null
    }, timeout)
    return true
  }

  onScopeDispose(clearTimer)

  return {
    copied: computed(() => copied.value),
    error: computed(() => error.value),
    isSupported: computed(() => writer !== null),
    copy,
  }
}
