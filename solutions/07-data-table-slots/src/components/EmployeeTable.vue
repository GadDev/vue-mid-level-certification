<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Employee, employees } from '../data/employees'
import DataTable from './DataTable.vue'

const showAll = ref(true)

const rows = computed<Employee[]>(() => (showAll.value ? employees : []))
const payroll = computed(() => rows.value.reduce((sum, row) => sum + row.salary, 0))
</script>
<template>
  <button data-testid="toggle" @click="showAll = !showAll">Toggle rows</button>

  <DataTable :items="rows" caption="Employees">
    <template #header>
      <th>Name</th>
      <th>Role</th>
      <th>Salary</th>
    </template>

    <!-- `item` is typed as Employee here thanks to the generic component. -->
    <template #row="{ item, index }">
      <td data-testid="cell-index">{{ index + 1 }}</td>
      <td data-testid="cell-name">{{ item.name }}</td>
      <td data-testid="cell-role">{{ item.role }}</td>
    </template>

    <template #empty>
      <span data-testid="custom-empty">Nobody here yet.</span>
    </template>

    <template #footer="{ count }">
      <span data-testid="custom-footer">{{ count }} employees — {{ payroll }} total</span>
    </template>
  </DataTable>
</template>
