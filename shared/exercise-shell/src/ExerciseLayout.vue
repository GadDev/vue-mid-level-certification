<script setup lang="ts">
import ExerciseTimer from './ExerciseTimer.vue'

withDefaults(defineProps<{ title: string; minutes: number; autostart?: boolean }>(), {
  autostart: true,
})

// The timer is only reachable through the layout, so its expiry has to be forwarded —
// otherwise an exercise cannot react to the budget running out.
const emit = defineEmits<{ done: [] }>()

defineSlots<{
  /** The exercise itself. */
  default?: () => unknown
  /** Extra controls for the nav bar, rendered between the title and the timer. */
  nav?: () => unknown
}>()
</script>

<template>
  <div class="exercise-shell">
    <header class="exercise-shell__nav" data-testid="exercise-nav">
      <h1 class="exercise-shell__title" data-testid="exercise-title">{{ title }}</h1>
      <span class="exercise-shell__slot"><slot name="nav" /></span>
      <ExerciseTimer :minutes="minutes" :autostart="autostart" @done="emit('done')" />
    </header>

    <main class="exercise-shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.exercise-shell__nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #e4e4e7;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(6px);
  font:
    500 0.85rem/1.3 system-ui,
    sans-serif;
}

.exercise-shell__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #18181b;
}

/* Pushes the timer to the far edge whether or not the nav slot is filled. */
.exercise-shell__slot {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.exercise-shell__main {
  padding: 1rem;
}
</style>
