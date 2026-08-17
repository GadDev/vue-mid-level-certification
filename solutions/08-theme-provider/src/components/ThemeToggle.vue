<script setup lang="ts">
import { useTheme } from '../theme'

const { theme, isDark, toggle, set } = useTheme()
</script>
<template>
  <button data-testid="toggle" @click="toggle">
    {{ isDark ? 'Switch to light' : 'Switch to dark' }}
  </button>
  <button data-testid="force-dark" @click="set('dark')">Dark</button>
  <span data-testid="toggle-theme">{{ theme }}</span>
</template>
