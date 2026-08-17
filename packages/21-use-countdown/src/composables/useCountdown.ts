import { type ComputedRef, computed, ref } from 'vue'

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

export function useCountdown(seconds = 60, options: CountdownOptions = {}): Countdown {
  const initial = ref(seconds)
  const remaining = ref(seconds)
  const running = ref(false)
  // biome-ignore lint/style/useConst: your implementation assigns the interval handle
  let timer: ReturnType<typeof setInterval> | null = null

  function start(): void {
    // TODO: tick once a second. Starting an already-running or finished
    // countdown must not add a second interval.
  }

  function pause(): void {
    // TODO: stop ticking, keep the remaining time.
  }

  function reset(next?: number): void {
    // TODO: stop, then restore the initial duration — or adopt the new one.
    void next
    void initial
    void timer
    void options
  }

  return {
    remaining: computed(() => remaining.value),
    running: computed(() => running.value),
    finished: computed(() => remaining.value === 0),
    // TODO: `mm:ss`, e.g. 90 seconds is '01:30'
    formatted: computed(() => ''),
    start,
    pause,
    reset,
  }
}
