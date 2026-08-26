<script setup lang="ts">
import DataPanel from './DataPanel.vue'

// TODO: this component only owns `title`. Every other prop a consumer passes
// (e.g. `items`) must land on <DataPanel>, not on this component's own root
// element — turn off automatic attribute inheritance and forward $attrs
// yourself.
defineProps<{
  title: string
}>()
</script>

<template>
  <section data-testid="panel-frame">
    <h2 data-testid="panel-frame-title">{{ title }}</h2>

    <!--
      TODO: pass DataPanel the forwarded attrs, and forward every slot this
      component received — named or scoped — without hardcoding their names.
      PanelFrame doesn't know what slots a consumer will use, so iterate
      `$slots` and re-open each one on <DataPanel> with the same params it
      was given.
    -->
    <DataPanel :items="[]" />
  </section>
</template>
