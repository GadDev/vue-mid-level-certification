export interface User {
  id: number
  name: string
  role: string
}

const DB: User[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer' },
  { id: 2, name: 'Bob Smith', role: 'Developer' },
  { id: 3, name: 'Marie Dupont', role: 'Developer' },
  { id: 4, name: 'John Walker', role: 'QA Engineer' },
]

/**
 * A fake HTTP call: slow, abortable, and it fails for the query "boom" so the
 * error path is reachable in the browser too.
 */
export function searchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      if (query.toLowerCase().includes('boom')) {
        reject(new Error('Search failed'))
        return
      }
      const q = query.toLowerCase()
      resolve(DB.filter(user => user.name.toLowerCase().includes(q)))
    }, 400)

    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
