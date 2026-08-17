<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const form = reactive({ name: 'Ada', address: { city: 'Paris' } })
const saves = ref(0)
const lastSaved = ref('')

// BUG: this watcher never fires — not for the name, and not for the city.
watch(
  () => form,
  updated => {
    saves.value++
    lastSaved.value = updated.name
  }
)

function rename(name: string): void {
  form.name = name
}

function move(city: string): void {
  form.address.city = city
}
</script>

<template>
  <div>
    <p data-testid="name">{{ form.name }}</p>
    <p data-testid="city">{{ form.address.city }}</p>
    <p data-testid="saves">{{ saves }}</p>
    <p data-testid="last">{{ lastSaved }}</p>
    <button type="button" data-testid="rename" @click="rename('Grace')">Rename</button>
    <button type="button" data-testid="move" @click="move('Lyon')">Move</button>
  </div>
</template>
