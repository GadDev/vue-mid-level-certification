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
    <!-- TODO: one state at a time — loading, error, the empty message, or the figures -->
    <p data-testid="loading">Loading…</p>
    <p data-testid="error" role="alert">{{ error }}</p>
    <p data-testid="empty">No data yet.</p>
    <dl>
      <dd data-testid="average">{{ average }}</dd>
      <dd data-testid="max">{{ max?.label }}</dd>
      <dd data-testid="min">{{ min?.label }}</dd>
      <dd data-testid="count">{{ count }}</dd>
    </dl>
  </div>
</template>
