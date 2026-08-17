<script setup lang="ts">
import { useTheme } from '../theme'

// Three levels below the plugin: injection does not care about depth.
const { theme } = useTheme()
</script>
<template>
  <span data-testid="deep-theme">{{ theme }}</span>
</template>
