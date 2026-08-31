<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ProgressWidget from './components/ProgressWidget.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ProgressWidget />
    </template>
  </Layout>
</template>
