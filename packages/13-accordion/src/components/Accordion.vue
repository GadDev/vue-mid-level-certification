<script setup lang="ts">
import { ref } from 'vue'
import type { AccordionSection } from '../data/sections'

const props = withDefaults(
  defineProps<{ sections: AccordionSection[]; defaultOpen?: string | null }>(),
  { defaultOpen: null }
)

const emit = defineEmits<{ change: [id: string | null] }>()

// TODO: only one section may be open at a time, and `defaultOpen` decides which
// one starts open — but only when it matches a section that actually exists.
const openId = ref<string | null>(null)

function toggle(id: string): void {
  // TODO: clicking the section that is already open closes it, and every change
  // emits `change` with the new open id (or null when everything is closed).
  openId.value = id
}
</script>

<template>
  <div class="accordion">
    <section v-for="section in props.sections" :key="section.id">
      <!-- TODO: aria-expanded must reflect whether this section is open -->
      <button
        type="button"
        :data-testid="`header-${section.id}`"
        aria-expanded="false"
        @click="toggle(section.id)"
      >
        {{ section.title }}
      </button>
      <!-- TODO: render the panel only while this section is open -->
      <p :data-testid="`panel-${section.id}`">{{ section.body }}</p>
    </section>
  </div>
</template>
