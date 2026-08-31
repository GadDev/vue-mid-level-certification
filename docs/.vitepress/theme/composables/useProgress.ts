import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'vue-cert-progress'
const TOTAL = 31

function load(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function save(value: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable (e.g. privacy mode) — progress just won't persist
  }
}

const completed = ref<Record<string, boolean>>(load())

watch(
  completed,
  value => {
    save(value)
  },
  { deep: true },
)

export function useProgress() {
  const count = computed(() => Object.values(completed.value).filter(Boolean).length)
  const percent = computed(() => Math.round((count.value / TOTAL) * 100))

  function toggle(id: string) {
    completed.value = { ...completed.value, [id]: !completed.value[id] }
  }

  function reset() {
    completed.value = {}
  }

  function setAll(data: Record<string, boolean>) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return
    completed.value = { ...data }
  }

  return { completed, toggle, count, total: TOTAL, percent, reset, setAll }
}
