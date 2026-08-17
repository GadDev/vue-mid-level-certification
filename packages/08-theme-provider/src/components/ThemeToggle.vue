<script setup lang="ts">
import { useTheme } from '../theme'

const { theme, isDark, toggle, set } = useTheme()
</script>
<template>
  <!-- TODO: a toggle button, a "force dark" button and the current theme -->
  <button data-testid="toggle">{{ isDark ? 'Switch to light' : 'Switch to dark' }}</button>
</template>
