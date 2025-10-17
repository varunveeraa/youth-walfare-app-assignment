<template>
  <FormCard
    title="Welcome Back"
    subtitle="Sign in to your MindBridge account"
    icon="account_circle"
    :error="authError"
    :loading="loading"
    submit-text="Sign In"
    submit-icon="login"
    loading-text="Signing In..."
    @submit="handleLogin"
  >
    <FormField
      id="email"
      label="Email"
      type="email"
      icon="email"
      v-model="form.email"
      :error="errors.email"
      required
    />

    <FormField
      id="password"
      label="Password"
      type="password"
      icon="lock"
      v-model="form.password"
      :error="errors.password"
      required
    />

    <!-- Remember Me -->
    <p>
      <label>
        <input type="checkbox" v-model="form.rememberMe" />
        <span>Remember me</span>
      </label>
    </p>

    <template #footer>
      <p>
        <a href="#" class="teal-text">Forgot your password?</a>
      </p>
      <p>
        Don't have an account?
        <router-link to="/register" class="teal-text">Sign up here</router-link>
      </p>
    </template>
  </FormCard>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateEmail, validateRequired } from '@/utils/validation'
import FormCard from '@/components/form/FormCard.vue'
import FormField from '@/components/form/FormField.vue'

const router = useRouter()
const route = useRoute()
const { login, loading, error: authError, clearError } = useAuth()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: null,
  password: null
})

const validateForm = () => {
  errors.email = validateEmail(form.email)
  errors.password = validateRequired(form.password, 'Password')

  return !errors.email && !errors.password
}

const handleLogin = async () => {
  clearError()

  if (!validateForm()) {
    return
  }

  try {
    await login(form.email, form.password)

    // Get the auth composable to check user role
    const { user, isYouthUser, isCounsellor, isAdmin } = useAuth()

    // Wait a bit more to ensure user data is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100))

    // Determine redirect destination
    let redirectTo = route.query.redirect

    if (!redirectTo) {
      // Check user role from the user object directly as a fallback
      const userRole = user.value?.role
      console.log('User role:', userRole)
      console.log('Role checks:', { isYouthUser: isYouthUser.value, isCounsellor: isCounsellor.value, isAdmin: isAdmin.value })

      // Navigate to role-specific dashboard
      if (isYouthUser.value || userRole === 'youth') {
        redirectTo = '/youth'
      } else if (isCounsellor.value || userRole === 'counsellor') {
        redirectTo = '/counsellor'
      } else if (isAdmin.value || userRole === 'admin') {
        redirectTo = '/admin'
      } else {
        redirectTo = '/dashboard'
      }
    }

    console.log('Redirecting to:', redirectTo)
    await router.push(redirectTo)
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<style scoped>
/* Minimal styles - most styling is handled by FormCard and FormField components */
</style>
