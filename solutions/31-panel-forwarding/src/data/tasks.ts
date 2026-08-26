import { ref } from 'vue'

export interface Task {
  id: number
  label: string
  done: boolean
}

const initial: Task[] = [
  { id: 1, label: 'Write the lesson', done: false },
  { id: 2, label: 'Wire up the router', done: true },
  { id: 3, label: 'Ship the release', done: false },
]

export const tasks = ref<Task[]>(initial.map(task => ({ ...task })))

export function resetTasks() {
  tasks.value = initial.map(task => ({ ...task }))
}
