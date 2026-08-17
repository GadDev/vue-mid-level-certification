import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // FIX: the state belongs inside the setup function. At module scope it is
  // created once per *import*, so every pinia instance — every test, every SSR
  // request — shared the same counter.
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment(): void {
    count.value++
  }

  function reset(): void {
    count.value = 0
  }

  return { count, double, increment, reset }
})
