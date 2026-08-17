<script setup lang="ts">
import { computed, ref } from 'vue'

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<{ max?: number; readonly?: boolean }>(), {
  max: 5,
  readonly: false,
})

// `null` means "not hovering" — 0 is a real rating, so it cannot double as the empty state.
const hovered = ref<number | null>(null)

// What the stars show: the preview while hovering, the committed value otherwise.
const displayed = computed(() => hovered.value ?? model.value)

function commit(value: number): void {
  if (props.readonly) return
  const next = Math.min(Math.max(value, 0), props.max)
  if (next === model.value) return
  model.value = next
}

function select(value: number): void {
  if (props.readonly) return
  // Clicking the current rating clears it — otherwise a 1-star rating is a trap.
  commit(value === model.value ? 0 : value)
}

function preview(value: number): void {
  if (props.readonly) return
  hovered.value = value
}

const STEPS: Record<string, (current: number, max: number) => number> = {
  ArrowRight: (current, max) => Math.min(current + 1, max),
  ArrowUp: (current, max) => Math.min(current + 1, max),
  ArrowLeft: current => Math.max(current - 1, 0),
  ArrowDown: current => Math.max(current - 1, 0),
  Home: () => 0,
  End: (_current, max) => max,
}

function onKeydown(event: KeyboardEvent): void {
  if (props.readonly) return
  const step = STEPS[event.key]
  if (!step) return
  event.preventDefault()
  commit(step(model.value, props.max))
}
</script>

<template>
  <div
    class="rating"
    role="slider"
    aria-label="Rating"
    data-testid="rating"
    :tabindex="props.readonly ? undefined : 0"
    :aria-readonly="props.readonly || undefined"
    :aria-valuenow="model"
    aria-valuemin="0"
    :aria-valuemax="props.max"
    @keydown="onKeydown"
    @mouseleave="hovered = null"
  >
    <button
      v-for="star in props.max"
      :key="star"
      type="button"
      :class="{ filled: star <= displayed }"
      :data-testid="`star-${star}`"
      @click="select(star)"
      @mouseenter="preview(star)"
    >
      ★
    </button>
    <span data-testid="value">{{ model }}</span>
  </div>
</template>
