import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue Mid-Level Certification Practice',
  description: '30 Vue 3 + TypeScript exercises for the mid-level Vue certification',
  base: '/vue-mid-level-certification/',
  cleanUrls: true,
  // docs/*.md cross-link to the root README and to packages/*, which live outside
  // this site's root (docs/) and aren't part of the build — valid on GitHub, not here.
  ignoreDeadLinks: [/\.\.\//],

  themeConfig: {
    siteTitle: "Vue Mid-Level Certification Practice",
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Setup', link: '/SETUP' },
      { text: 'Lessons', link: '/lessons/' },
      { text: 'Learning Path', link: '/LEARNING_PATH' },
      { text: 'Patterns', link: '/PATTERNS' },
      { text: 'Blog', link: '/blog/' },
    ],
    outline: 'deep',

    sidebar: {
      '/lessons/': [
        {
          text: 'Batch 1 — fundamentals',
          items: [
            { text: '01 — Reaching the real DOM from Vue', link: '/lessons/01-scroll-to-item' },
            { text: '02 — State that describes the UI vs. the data', link: '/lessons/02-shopping-list' },
            { text: '03 — `computed`, and why not a method', link: '/lessons/03-search-users' },
            { text: '04 — Sorting without breaking your source', link: '/lessons/04-sort-products' },
            { text: '05 — Your first `useX()` composable', link: '/lessons/05-counter-history' },
          ],
        },
        {
          text: 'Batch 2 — composition & ecosystem',
          items: [
            { text: '06 — Building a component the parent still owns', link: '/lessons/06-base-input' },
            { text: '07 — Letting the caller decide what renders', link: '/lessons/07-data-table-slots' },
            { text: '08 — Passing data down without props', link: '/lessons/08-theme-provider' },
            { text: "09 — Why /users/2 doesn't re-run your setup()", link: '/lessons/09-router-master-detail' },
            { text: '10 — Shared state that survives destructuring', link: '/lessons/10-pinia-cart' },
            { text: "11 — Async work that keeps changing its mind", link: '/lessons/11-async-search' },
            { text: '12 — Composables that clean up after themselves', link: '/lessons/12-composable-storage' },
          ],
        },
        {
          text: 'Batch 3 — component patterns',
          items: [
            { text: '13 — One open at a time, by construction', link: '/lessons/13-accordion' },
            { text: '14 — When the list changes under the selection', link: '/lessons/14-tabs' },
            { text: "15 — Rendering a form you didn't write", link: '/lessons/15-dynamic-form' },
            { text: '16 — Two pieces of state that look like one', link: '/lessons/16-rating' },
            { text: '17 — Fallback content, and listeners that die with the component', link: '/lessons/17-modal' },
          ],
        },
        {
          text: 'Batch 4 — stateful UI & composables',
          items: [
            { text: '18 — One timer per item, all of them yours', link: '/lessons/18-notification-queue' },
            { text: '19 — Clamping is a derivation, not an assignment', link: '/lessons/19-pagination' },
            { text: "20 — The second call that shouldn't happen", link: '/lessons/20-infinite-scroll' },
            { text: '21 — Owning setInterval', link: '/lessons/21-use-countdown' },
            { text: '22 — The request state machine', link: '/lessons/22-use-fetch' },
            { text: "23 — APIs that might not be there", link: '/lessons/23-clipboard' },
          ],
        },
        {
          text: 'Batch 5 — ecosystem at scale',
          items: [
            { text: '24 — Getters that take an argument', link: '/lessons/24-pinia-wishlist' },
            { text: '25 — The store knows who; the router decides where', link: '/lessons/25-pinia-auth-guard' },
            { text: '26 — Trusting nothing on the way in', link: '/lessons/26-dashboard-stats' },
            { text: '27 — The URL is the state', link: '/lessons/27-query-filters' },
            { text: '28 — Never hand-write a breadcrumb trail', link: '/lessons/28-breadcrumbs' },
          ],
        },
        {
          text: 'Batch 6 — debugging',
          items: [
            { text: '29 — Why reactive code stops working', link: '/lessons/29-debug-reactivity' },
            { text: '30 — Contracts that look fine until there are two', link: '/lessons/30-debug-emits-store' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GadDev/vue-mid-level-certification' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Alexandre Gadaix',
    },
  },
})
