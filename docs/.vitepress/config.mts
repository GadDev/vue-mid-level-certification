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
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Setup', link: '/SETUP' },
      { text: 'Learning Path', link: '/LEARNING_PATH' },
      { text: 'Patterns', link: '/PATTERNS' },
      { text: 'Anti-Patterns', link: '/ANTI_PATTERNS' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Setup & Troubleshooting', link: '/SETUP' },
          { text: 'Learning Path & Exam Coverage', link: '/LEARNING_PATH' },
          { text: 'Patterns', link: '/PATTERNS' },
          { text: 'Anti-Patterns', link: '/ANTI_PATTERNS' },
        ],
      },
    ],

    outline: 'deep',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GadDev/vue-mid-level-certification' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 GadDev',
    },
  },
})
