<script setup lang="ts">
import { ref } from 'vue'
import type { AccordionSection } from '../data/sections'

const props = withDefaults(
  defineProps<{ sections: AccordionSection[]; defaultOpen?: string | null }>(),
  { defaultOpen: null }
)

const emit = defineEmits<{ change: [id: string | null] }>()

// One id, not a flag per section: "only one open" is then true by construction.
const openId = ref<string | null>(
  props.sections.some(section => section.id === props.defaultOpen) ? props.defaultOpen : null
)

function toggle(id: string): void {
  openId.value = openId.value === id ? null : id
  emit('change', openId.value)
}
</script>

<template>
  <div class="accordion">
    <section v-for="section in props.sections" :key="section.id">
      <button
        type="button"
        :data-testid="`header-${section.id}`"
        :aria-expanded="openId === section.id"
        @click="toggle(section.id)"
      >
        {{ section.title }}
      </button>
      <p v-if="openId === section.id" :data-testid="`panel-${section.id}`">{{ section.body }}</p>
    </section>
  </div>
</template>
