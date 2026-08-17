<script setup lang="ts">
import { useBreadcrumbs } from '../composables/useBreadcrumbs'

const crumbs = useBreadcrumbs()
</script>

<template>
  <nav aria-label="Breadcrumb" data-testid="breadcrumbs">
    <ol>
      <li v-for="crumb in crumbs" :key="crumb.path" data-testid="crumb">
        <!-- TODO: the current page is plain text with aria-current, the rest are links -->
        <RouterLink :to="crumb.path">{{ crumb.label }}</RouterLink>
      </li>
    </ol>
  </nav>
</template>
