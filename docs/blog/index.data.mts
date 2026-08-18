import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  date: string
  tags: string[]
  summary: string
  url: string
  readTime?: number
}

declare const data: Post[]
export { data }

// readTime is exempt on posts published before that field existed (see
// docs/blog/2026-08-18-how-this-repo-teaches-vue.md) — every other field is required on every post.
function validateFrontmatter(url: string, frontmatter: Record<string, unknown>): void {
  const missing = (['title', 'date', 'tags', 'summary'] as const).filter(
    field => frontmatter[field] === undefined
  )
  if (missing.length > 0) {
    throw new Error(`${url}: missing required frontmatter field(s): ${missing.join(', ')}`)
  }

  const dateFromFilename = url.match(/(\d{4}-\d{2}-\d{2})-[^/]+\/?$/)?.[1]
  if (dateFromFilename && frontmatter.date !== dateFromFilename) {
    throw new Error(
      `${url}: frontmatter date "${frontmatter.date}" does not match the filename date "${dateFromFilename}"`
    )
  }

  if (
    frontmatter.readTime !== undefined &&
    (typeof frontmatter.readTime !== 'number' ||
      !Number.isInteger(frontmatter.readTime) ||
      frontmatter.readTime < 1)
  ) {
    throw new Error(`${url}: readTime must be a positive integer when present`)
  }
}

export default createContentLoader('blog/*.md', {
  excerpt: false,
  render: false,
  transform(rawData) {
    return rawData
      .filter(({ url }) => !url.endsWith('/blog/'))
      .map(({ url, frontmatter }) => {
        validateFrontmatter(url, frontmatter)
        return {
          title: frontmatter.title,
          date: frontmatter.date,
          tags: frontmatter.tags,
          summary: frontmatter.summary,
          readTime: frontmatter.readTime,
          url,
        }
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})
