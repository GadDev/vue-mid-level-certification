<script setup lang="ts" generic="T extends { id: number | string }">
// A generic component: the row slot's `item` is typed as T for the consumer,
// so the parent gets autocompletion on its own row shape.
const props = defineProps<{
  items: T[]
  caption?: string
}>()

defineSlots<{
  header?: () => unknown
  row?: (props: { item: T; index: number }) => unknown
  empty?: () => unknown
  footer?: (props: { count: number }) => unknown
}>()
</script>
<template>
  <table data-testid="table">
    <caption v-if="props.caption" data-testid="caption">
      {{
        props.caption
      }}
    </caption>
    <thead>
      <tr data-testid="header-row">
        <!-- Named slot with fallback content: consumers may override it. -->
        <slot name="header">
          <th>Item</th>
        </slot>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!props.items.length" data-testid="empty-row">
        <td>
          <slot name="empty">No data.</slot>
        </td>
      </tr>
      <tr v-for="(item, index) in props.items" :key="item.id" data-testid="row">
        <!-- Scoped slot: the child owns the loop, the parent owns the cells. -->
        <slot name="row" :item="item" :index="index">
          <td data-testid="fallback-cell">{{ item.id }}</td>
        </slot>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>
          <slot name="footer" :count="props.items.length">{{ props.items.length }} rows</slot>
        </td>
      </tr>
    </tfoot>
  </table>
</template>
