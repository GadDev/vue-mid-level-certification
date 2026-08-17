import { type ComputedRef, computed, onScopeDispose, ref } from 'vue'

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
  let nextId = 1

  function cancel(id: number): void {
    const timer = timers.get(id)
    if (timer === undefined) return
    clearTimeout(timer)
    timers.delete(id)
  }

  function dismiss(id: number): void {
    cancel(id)
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  function notify(message: string, type: ToastType = 'info'): number {
    const id = nextId++
    // push, not unshift: the queue reads oldest first.
    toasts.value.push({ id, message, type })
    // One timer per toast — a single shared timer would dismiss the newest one
    // on the oldest one's schedule.
    if (duration > 0)
      timers.set(
        id,
        setTimeout(() => dismiss(id), duration)
      )
    return id
  }

  function clear(): void {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    toasts.value = []
  }

  onScopeDispose(clear)

  return { toasts: computed(() => toasts.value), notify, dismiss, clear }
}
