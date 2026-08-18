import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  date: string
  tags: string[]
  summary: string
  url: string
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/*.md', {
  excerpt: false,
  render: false,
  transform(rawData) {
    return rawData
      .filter(({ url }) => !url.endsWith('/blog/'))
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        date: frontmatter.date,
        tags: frontmatter.tags,
        summary: frontmatter.summary,
        url,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})
