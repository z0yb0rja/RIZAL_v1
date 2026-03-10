import { createApp } from 'vue'
import router from '@/router/index.js'
import App from './App.vue'
import './assets/css/main.css'

// Apply the theme immediately from mock data (swap with API response in production)
import { loadTheme, applyTheme } from '@/config/theme.js'
import { mockCurrentUser, mockRtuSettings, mockJrmsuSettings } from '@/data/mockData.js'

// Automatically select the theme based on the mock user's configured school_id
const activeSettings = (mockCurrentUser.school_id === 2) ? mockJrmsuSettings : mockRtuSettings

const currentTheme = loadTheme(activeSettings)
applyTheme(currentTheme)

const app = createApp(App)
app.use(router)
app.mount('#app')
