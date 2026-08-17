export interface Post {
  id: string
  title: string
}

/** A fake API — slow on purpose, so the cache is visible in the browser. */
export function fetchPost(id: string): Promise<Post> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === '404') reject(new Error('not found'))
      else resolve({ id, title: `Post ${id}` })
    }, 400)
  })
}
