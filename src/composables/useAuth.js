import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
    const router = useRouter()
    const isLoading = ref(false)
    const error = ref(null)

    async function login(email, password) {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with real API call
            await new Promise((resolve) => setTimeout(resolve, 800))

            if (email && password) {
                localStorage.setItem('aura_token', 'mock_token')
                localStorage.setItem('mock_logged_in_email', email) // Store email to pick right mock user
                router.push({ name: 'Home' })
            } else {
                throw new Error('Please enter your email and password.')
            }
        } catch (err) {
            error.value = err.message || 'Login failed. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    function logout() {
        localStorage.removeItem('aura_token')
        router.push({ name: 'Login' })
    }

    return { login, logout, isLoading, error }
}
