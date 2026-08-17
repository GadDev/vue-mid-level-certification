<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
</script>
<template>
  <ExerciseLayout title="09-router-master-detail" :minutes="35">
    <nav>
      <RouterLink :to="{ name: 'users' }" data-testid="nav-users">Users</RouterLink>
    </nav>
    <RouterView />
  </ExerciseLayout>
</template>
