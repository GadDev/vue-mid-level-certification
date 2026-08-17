import { type ComputedRef, computed, ref } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export interface ToastQueue {
  toasts: ComputedRef<Toast[]>
  /** Queues a toast and returns its id. */
  notify: (message: string, type?: ToastType) => number
  dismiss: (id: number) => void
  clear: () => void
}

/**
 * `duration` is how long a toast lives, in ms. `0` means it stays until dismissed.
 */
export function useToasts(duration = 3000): ToastQueue {
  const toasts = ref<Toast[]>([])
  const timers = new Map<number, ReturnType<typeof setTimeout>>()
  // biome-ignore lint/style/useConst: your implementation increments this
  let nextId = 1

  function notify(message: string, type: ToastType = 'info'): number {
    // TODO: queue the toast (newest last) and give it its own dismiss timer.
    void message
    void type
    return nextId
  }

  function dismiss(id: number): void {
    // TODO: remove the toast and cancel the timer it will no longer need.
    void id
  }

  function clear(): void {
    // TODO: drop everything, timers included.
  }

  // TODO: pending timers must not outlive the scope that owns this queue.

  return { toasts: computed(() => toasts.value), notify, dismiss, clear }
}
