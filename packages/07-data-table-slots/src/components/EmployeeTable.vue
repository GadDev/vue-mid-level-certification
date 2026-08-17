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

  <!-- TODO: fill every slot of DataTable:
       #header with Name / Role / Salary,
       #row="{ item, index }" with cell-index, cell-name and cell-role cells,
       #empty with a custom-empty message,
       #footer="{ count }" with a custom-footer showing count and payroll. -->
  <DataTable :items="rows" caption="Employees" />
</template>
