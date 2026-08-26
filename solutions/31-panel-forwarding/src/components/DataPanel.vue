<script setup lang="ts" generic="T extends { id: number | string }">
const props = defineProps<{
  items: T[]
}>()

defineSlots<{
  header?(): unknown
  item?(props: { item: T; index: number }): unknown
  empty?(): unknown
  footer?(props: { count: number }): unknown
}>()
</script>

<template>
  <section data-testid="data-panel">
    <header data-testid="panel-header">
      <slot name="header">Items</slot>
    </header>
    <p v-if="!props.items.length" data-testid="empty-state">
      <slot name="empty">Nothing here.</slot>
    </p>
    <ul v-else>
      <li v-for="(item, index) in props.items" :key="item.id" data-testid="item-row">
        <slot name="item" :item="item" :index="index">
          <span data-testid="fallback-item">{{ item.id }}</span>
        </slot>
      </li>
    </ul>
    <footer data-testid="panel-footer">
      <slot name="footer" :count="props.items.length">{{ props.items.length }} items</slot>
    </footer>
  </section>
</template>
