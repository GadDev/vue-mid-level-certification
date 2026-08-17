import { createApp } from 'vue'
import App from './App.vue'
import { createTheme } from './theme'

createApp(App).use(createTheme('light')).mount('#app')
