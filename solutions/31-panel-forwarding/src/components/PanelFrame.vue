<script setup lang="ts">
import DataPanel from './DataPanel.vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  title: string
}>()
</script>

<template>
  <section data-testid="panel-frame">
    <h2 data-testid="panel-frame-title">{{ title }}</h2>

    <DataPanel v-bind="$attrs as { items: { id: string | number }[] }">
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </DataPanel>
  </section>
</template>
