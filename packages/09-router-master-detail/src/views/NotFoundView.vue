<template>
  <p data-testid="not-found">Nothing here.</p>
  <RouterLink :to="{ name: 'users' }" data-testid="back">Back to users</RouterLink>
</template>
