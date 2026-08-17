<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useStatsStore } from '../stores/stats'

const stats = useStatsStore()
const { average, max, min, count, loading, error } = storeToRefs(stats)

onMounted(stats.load)
</script>

<template>
  <div>
    <p v-if="loading" data-testid="loading">Loading…</p>
    <p v-else-if="error" data-testid="error" role="alert">{{ error }}</p>
    <p v-else-if="count === 0" data-testid="empty">No data yet.</p>
    <dl v-else>
      <dd data-testid="average">{{ average }}</dd>
      <dd data-testid="max">{{ max?.label }}</dd>
      <dd data-testid="min">{{ min?.label }}</dd>
      <dd data-testid="count">{{ count }}</dd>
    </dl>
  </div>
</template>
