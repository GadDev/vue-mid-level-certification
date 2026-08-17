<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ minutes: number; autostart?: boolean }>(), {
  autostart: true,
})

const emit = defineEmits<{ done: [] }>()

/** A non-positive (or non-finite) budget means "no timer at all", not "already expired". */
const total = computed(() =>
  Number.isFinite(props.minutes) ? Math.max(0, Math.round(props.minutes * 60)) : 0
)

const running = ref(false)

/**
 * The countdown is driven by a wall-clock deadline rather than by decrementing once
 * per tick: `setInterval` drifts, and browsers throttle it to roughly once a minute
 * in a background tab. Over a 40 min exercise that silently hands back real time.
 *
 * The remainder is stored in **milliseconds** for the same reason. The readout rounds
 * up to whole seconds, but rounding the stored value would hand back up to a second
 * on every pause/resume cycle — ten pauses, ten free seconds.
 */
const remainingMs = ref(total.value * 1000)
let deadline = 0
let timer: ReturnType<typeof setInterval> | undefined

const remaining = computed(() => Math.ceil(remainingMs.value / 1000))
const finished = computed(() => total.value > 0 && remainingMs.value === 0)
// Scaled to the budget, so a one-minute exercise is not amber from its first frame.
const warning = computed(
  () => !finished.value && total.value > 0 && remaining.value <= Math.min(60, total.value / 2)
)

const display = computed(() => {
  const mm = String(Math.floor(remaining.value / 60)).padStart(2, '0')
  const ss = String(remaining.value % 60).padStart(2, '0')
  return `${mm}:${ss}`
})

const elapsed = computed(() =>
  total.value === 0 ? 0 : Math.round(((total.value - remaining.value) / total.value) * 100)
)

function clear(): void {
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}

function tick(): void {
  remainingMs.value = Math.max(0, deadline - Date.now())
  if (remainingMs.value > 0) return
  clear()
  running.value = false
  emit('done')
}

function start(): void {
  // Guard the double start: without it a second call leaks the first interval.
  if (running.value || remainingMs.value === 0) return
  running.value = true
  deadline = Date.now() + remainingMs.value
  timer = setInterval(tick, 250)
}

function pause(): void {
  if (!running.value) return
  clear()
  running.value = false
  // Store the exact remainder, so resuming does not round the clock backwards.
  tick()
}

function reset(): void {
  clear()
  running.value = false
  remainingMs.value = total.value * 1000
}

function toggle(): void {
  if (running.value) pause()
  else start()
}

// A new budget (hot reload, or a parent swapping exercises) reloads the clock and
// leaves it paused: the old elapsed time means nothing against a different budget.
watch(total, next => {
  clear()
  running.value = false
  remainingMs.value = next * 1000
})

// Fires on unmount *and* on `effectScope().stop()`, so the interval can never outlive us.
onScopeDispose(clear)

// In `onMounted`, not in the setup body: on the server there is no unmount, so an
// interval started during SSR would never be cleared and would hold the process open.
onMounted(() => {
  if (props.autostart) start()
})

defineExpose({ remaining, running, start, pause, reset })
</script>

<template>
  <div
    v-if="total > 0"
    class="exercise-timer"
    :class="{ 'is-running': running, 'is-warning': warning, 'is-finished': finished }"
    data-testid="exercise-timer"
  >
    <span class="exercise-timer__readout">
      <strong role="timer" data-testid="exercise-timer-remaining">{{ display }}</strong>
      <span class="exercise-timer__budget">/ {{ minutes }} min</span>
    </span>

    <span class="exercise-timer__bar" aria-hidden="true">
      <span class="exercise-timer__fill" :style="{ width: `${elapsed}%` }" />
    </span>

    <button
      type="button"
      class="exercise-timer__button"
      :disabled="finished"
      data-testid="exercise-timer-toggle"
      @click="toggle"
    >
      {{ running ? 'Pause' : 'Start' }}
    </button>
    <button
      type="button"
      class="exercise-timer__button"
      data-testid="exercise-timer-reset"
      @click="reset"
    >
      Reset
    </button>

    <span v-if="finished" role="status" class="exercise-timer__done" data-testid="exercise-timer-done">
      Time is up
    </span>
  </div>
</template>

<style scoped>
.exercise-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3f3f46;
}

.exercise-timer__readout {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.exercise-timer__readout strong {
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.exercise-timer__budget {
  font-size: 0.7rem;
  color: #a1a1aa;
}

.exercise-timer__bar {
  width: 5rem;
  height: 4px;
  border-radius: 999px;
  background: #e4e4e7;
  overflow: hidden;
}

.exercise-timer__fill {
  display: block;
  height: 100%;
  background: currentcolor;
  transition: width 0.25s linear;
}

.exercise-timer__button {
  padding: 0.25rem 0.6rem;
  border: 1px solid #d4d4d8;
  border-radius: 0.3rem;
  background: #fff;
  font: inherit;
  font-size: 0.75rem;
  color: inherit;
  cursor: pointer;
}

.exercise-timer__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.exercise-timer.is-warning {
  color: #b45309;
}

.exercise-timer.is-finished {
  color: #b91c1c;
}

.exercise-timer__done {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
