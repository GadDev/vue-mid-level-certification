<script setup lang="ts">
import { useTheme } from '../theme'
import DeepLabel from './DeepLabel.vue'

const { theme, isDark } = useTheme()
</script>
<template>
  <!-- TODO: class `theme-light` / `theme-dark`, data-dark, the theme text,
       and the nested DeepLabel -->
  <section data-testid="panel">
    <DeepLabel />
  </section>
</template>
