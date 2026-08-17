<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const form = reactive({ name: 'Ada', address: { city: 'Paris' } })
const saves = ref(0)
const lastSaved = ref('')

// FIX: `() => form` returns the same proxy every time, so the watcher compared
// it to itself and never fired. Watching a reactive object directly is deep by
// default, which is also what makes the nested city change count.
watch(form, updated => {
  saves.value++
  lastSaved.value = updated.name
})

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
