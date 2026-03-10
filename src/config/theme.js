import { ref } from 'vue'

/**
 * Global Dark Mode State
 */
export const isDarkMode = ref(false)
export const activeAuraLogo = ref('/logos/aura_logo_black.png')
let currentActiveTheme = null

/**
 * School Theme Configuration
 * School IT can customize: primary accent color, logo, and school name.
 * These would be loaded from /school-settings/me endpoint in production.
 */
export const defaultTheme = {
    // Customizable by School IT
    primaryColor: '#AAFF00',       // Lime green - the accent/brand color
    primaryDark: '#88CC00',        // Slightly darker for hover states
    primaryText: '#0A0A0A',        // Text on primary colored backgrounds
    schoolName: 'University Name',
    schoolSlogan: 'Slogan Goes Here',
    schoolLogo: '/logos/university_logo.svg', // Replace with actual school PNG

    // Fixed Aura system colors
    background: '#EBEBEB',
    surfaceColor: '#FFFFFF',
    navColor: '#0A0A0A',
    navActiveColor: '#AAFF00',
    textPrimary: '#0A0A0A',
    textSecondary: '#555555',
    textMuted: '#999999',
}

/**
 * Load theme - in production, fetches from API and merges school settings.
 */
export function loadTheme(schoolSettings = null) {
    if (!schoolSettings) return defaultTheme

    return {
        ...defaultTheme,
        primaryColor: schoolSettings.primary_color ?? defaultTheme.primaryColor,
        primaryDark: schoolSettings.primary_color_dark ?? defaultTheme.primaryDark,
        schoolName: schoolSettings.school_name ?? defaultTheme.schoolName,
        schoolSlogan: schoolSettings.slogan ?? defaultTheme.schoolSlogan,
        schoolLogo: schoolSettings.logo_url ?? defaultTheme.schoolLogo,
    }
}

/**
 * Darken a hex color by a given percentage
 */
function darkenHex(hex, percent) {
    hex = hex.replace('#', '')
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    if (hex.length === 8) hex = hex.substring(0, 6) // ignore alpha channel

    let r = parseInt(hex.substring(0, 2), 16)
    let g = parseInt(hex.substring(2, 4), 16)
    let b = parseInt(hex.substring(4, 6), 16)

    const multiplier = 1 - (percent / 100)

    r = Math.max(0, Math.min(255, Math.floor(r * multiplier)))
    g = Math.max(0, Math.min(255, Math.floor(g * multiplier)))
    b = Math.max(0, Math.min(255, Math.floor(b * multiplier)))

    const toHex = (n) => {
        const h = n.toString(16)
        return h.length === 1 ? '0' + h : h
    }

    return '#' + toHex(r) + toHex(g) + toHex(b)
}

/**
 * Calculate the best text color (black or white) for a given hex background
 * using the YIQ luminance formula.
 */
function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace('#', '')
    if (hexcolor.length === 3) {
        hexcolor = hexcolor[0] + hexcolor[0] + hexcolor[1] + hexcolor[1] + hexcolor[2] + hexcolor[2]
    }
    const r = parseInt(hexcolor.substr(0, 2), 16)
    const g = parseInt(hexcolor.substr(2, 2), 16)
    const b = parseInt(hexcolor.substr(4, 2), 16)
    // YIQ formula
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    // If luminance is > 128, background is light, use dark text. Otherwise use white text.
    return (yiq >= 128) ? '#0A0A0A' : '#FFFFFF'
}

export function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    if (currentActiveTheme) {
        applyTheme(currentActiveTheme)
    }
}

/**
 * Apply theme CSS variables to the document root.
 */
export function applyTheme(theme) {
    currentActiveTheme = theme
    const root = document.documentElement

    // Dynamic colors based on dark mode state
    let bgColor = theme.background
    let surfaceColor = theme.surfaceColor
    let textPrimary = theme.textPrimary

    if (isDarkMode.value) {
        // Dark mode: background is 96% darker than primary color
        // Example: #AAFF00 -> #070a00
        bgColor = darkenHex(theme.primaryColor, 96)

        // In the dark mode Figma reference:
        // - the main cards (Welcome, Latest Event, Upcoming Events) remain white surfaces
        // - the profile pill remains white
        // - the navigation pill turns slightly light grey
        // - text on the dark body needs to be white, but text inside white cards remains black

        // We keep surfaceColor white for the big cards
        textPrimary = '#FFFFFF' // This applies to body text (like "Home", "Upcoming Events" headers)
    }

    root.style.setProperty('--color-primary', theme.primaryColor)
    root.style.setProperty('--color-primary-dark', theme.primaryDark)
    root.style.setProperty('--color-primary-text', theme.primaryText)
    root.style.setProperty('--color-bg', bgColor)
    root.style.setProperty('--color-surface', surfaceColor) // White cards
    root.style.setProperty('--color-profile-bg', '#FFFFFF') // Always white
    root.style.setProperty('--color-nav-pill-bg', isDarkMode.value ? '#EBEBEB' : '#FFFFFF') // Nav Action pills
    root.style.setProperty('--color-nav', theme.navColor)
    root.style.setProperty('--color-nav-active', theme.navActiveColor)
    root.style.setProperty('--color-text-primary', textPrimary)      // Body headings
    root.style.setProperty('--color-text-secondary', isDarkMode.value ? '#A0A0A0' : theme.textSecondary)
    root.style.setProperty('--color-text-muted', theme.textMuted)

    // Create a special variable for text that must ALWAYS be dark (inside white cards)
    root.style.setProperty('--color-text-always-dark', '#0A0A0A')

    // Smart contrast text for the dark/light University Banner
    const bannerTextColor = getContrastYIQ(theme.primaryColor)
    root.style.setProperty('--color-banner-text', bannerTextColor)

    // Automatically serve the correct Aura logo color based on banner contrast
    activeAuraLogo.value = bannerTextColor === '#FFFFFF'
        ? '/logos/aura_logo_white.png'
        : '/logos/aura_logo_black.png'
}
