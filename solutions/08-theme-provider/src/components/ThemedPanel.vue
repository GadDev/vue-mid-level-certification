<script setup lang="ts">
import { useTheme } from '../theme'
import DeepLabel from './DeepLabel.vue'

const { theme, isDark } = useTheme()
</script>
<template>
  <section data-testid="panel" :class="`theme-${theme}`" :data-dark="isDark">
    <p data-testid="panel-theme">{{ theme }}</p>
    <DeepLabel />
  </section>
</template>
