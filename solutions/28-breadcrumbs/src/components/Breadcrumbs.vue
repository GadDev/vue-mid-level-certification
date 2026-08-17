<script setup lang="ts">
import { useBreadcrumbs } from '../composables/useBreadcrumbs'

const crumbs = useBreadcrumbs()
</script>

<template>
  <nav aria-label="Breadcrumb" data-testid="breadcrumbs">
    <ol>
      <li v-for="crumb in crumbs" :key="crumb.path" data-testid="crumb">
        <span v-if="crumb.isCurrent" aria-current="page">{{ crumb.label }}</span>
        <RouterLink v-else :to="crumb.path">{{ crumb.label }}</RouterLink>
      </li>
    </ol>
  </nav>
</template>
