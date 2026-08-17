import { type ComputedRef, computed, onScopeDispose, ref } from 'vue'

export interface CountdownOptions {
  /** Called once, when the countdown reaches zero. */
  onDone?: () => void
}

export interface Countdown {
  /** Seconds left. */
  remaining: ComputedRef<number>
  running: ComputedRef<boolean>
  finished: ComputedRef<boolean>
  /** `mm:ss`, zero-padded. */
  formatted: ComputedRef<string>
  start: () => void
  pause: () => void
  /** Back to `seconds`, or to a new duration when one is given. */
  reset: (seconds?: number) => void
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function useCountdown(seconds = 60, options: CountdownOptions = {}): Countdown {
  const initial = ref(seconds)
  const remaining = ref(seconds)
  const running = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  function stop(): void {
    if (timer !== null) clearInterval(timer)
    timer = null
    running.value = false
  }

  function start(): void {
    // Guarding on `timer` — not just on `running` — is what stops a second
    // interval from being created and the clock from ticking twice as fast.
    if (timer !== null || remaining.value === 0) return

    running.value = true
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (remaining.value > 0) return
      stop()
      options.onDone?.()
    }, 1000)
  }

  function pause(): void {
    stop()
  }

  function reset(next?: number): void {
    stop()
    if (next !== undefined) initial.value = next
    remaining.value = initial.value
  }

  onScopeDispose(stop)

  return {
    remaining: computed(() => remaining.value),
    running: computed(() => running.value),
    finished: computed(() => remaining.value === 0),
    formatted: computed(
      () => `${pad(Math.floor(remaining.value / 60))}:${pad(remaining.value % 60)}`
    ),
    start,
    pause,
    reset,
  }
}
