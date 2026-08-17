<script setup lang="ts">
import { ref } from 'vue'

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<{ max?: number; readonly?: boolean }>(), {
  max: 5,
  readonly: false,
})

// TODO: hovering previews a value without committing it — `null` means "not hovering".
const hovered = ref<number | null>(null)

function select(value: number): void {
  // TODO: ignore everything while readonly, and clicking the current rating clears it to 0.
  model.value = value
}

function onKeydown(event: KeyboardEvent): void {
  // TODO: ArrowRight / ArrowLeft step by one and clamp to 0…max, Home is 0, End is max.
  // Handled keys must call event.preventDefault(); anything else is left alone.
  void event
}
</script>

<template>
  <!-- TODO: the group is a slider for assistive tech — expose the current value,
       its bounds, and make it focusable only when it is editable -->
  <div
    class="rating"
    role="slider"
    aria-label="Rating"
    data-testid="rating"
    @keydown="onKeydown"
    @mouseleave="hovered = null"
  >
    <!-- TODO: `filled` follows the hovered value while hovering, the model otherwise -->
    <button
      v-for="star in props.max"
      :key="star"
      type="button"
      :data-testid="`star-${star}`"
      @click="select(star)"
      @mouseenter="hovered = star"
    >
      ★
    </button>
    <span data-testid="value">{{ model }}</span>
  </div>
</template>
