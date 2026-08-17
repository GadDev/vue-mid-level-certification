<script setup lang="ts" generic="T extends { id: number | string }">
const props = defineProps<{
  items: T[]
  caption?: string
}>()

// TODO: declare the slot contract with defineSlots — header, row({ item, index }),
// empty and footer({ count }).
</script>
<template>
  <table data-testid="table">
    <!-- TODO: optional caption -->
    <thead>
      <tr data-testid="header-row">
        <!-- TODO: `header` named slot, with a fallback <th>Item</th> -->
        <th>Item</th>
      </tr>
    </thead>
    <tbody>
      <!-- TODO: an `empty-row` with the `empty` slot (fallback "No data.")
           when there are no items -->
      <tr v-for="(item, index) in props.items" :key="item.id" data-testid="row">
        <!-- TODO: `row` scoped slot exposing item + index,
             with a fallback cell showing item.id -->
        <td data-testid="fallback-cell">{{ item.id }}</td>
      </tr>
    </tbody>
    <!-- TODO: tfoot with the `footer` scoped slot exposing count -->
  </table>
</template>
