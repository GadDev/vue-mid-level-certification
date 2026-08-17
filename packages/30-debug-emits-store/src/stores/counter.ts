import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// BUG: this state is created once, when the module is imported.
const count = ref(0)

export const useCounterStore = defineStore('counter', () => {
  const double = computed(() => count.value * 2)

  function increment(): void {
    count.value++
  }

  function reset(): void {
    count.value = 0
  }

  return { count, double, increment, reset }
})
