import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import MarkComplete from './components/MarkComplete.vue'
import ProgressChecklist from './components/ProgressChecklist.vue'
import './custom.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('MarkComplete', MarkComplete)
    app.component('ProgressChecklist', ProgressChecklist)
  },
} satisfies Theme
