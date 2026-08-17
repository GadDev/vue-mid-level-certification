export interface Post {
  id: number
  title: string
}

export const PAGE_SIZE = 20
const TOTAL = 55

/** A fake API: page 1, 2, 3 … the last page is short, and page 4 is empty. */
export function fetchPosts(page: number): Promise<Post[]> {
  const start = (page - 1) * PAGE_SIZE
  const posts = Array.from({ length: Math.max(0, Math.min(PAGE_SIZE, TOTAL - start)) }, (_, i) => ({
    id: start + i + 1,
    title: `Post ${start + i + 1}`,
  }))
  return new Promise(resolve => setTimeout(() => resolve(posts), 50))
}
