<template>
  <FormCard
    card-title="Welcome Back"
    card-subheading="Access your MindBridge account"
    header-icon="account_circle"
    :system-notification="authError"
    :operation-active="loading"
    submit-label="Sign In"
    submit-icon-symbol="login"
    loading-label="Authenticating..."
    @submit="processLogin"
  >
    <FormField
      element-identifier="email"
      label-text="Email Address"
      input-category="email"
      icon-symbol="email"
      v-model="loginForm.email"
      :error-message="validationErrors.email"
      mandatory-field
    />

    <FormField
      element-identifier="password"
      label-text="Password"
      input-category="password"
      icon-symbol="lock"
      v-model="loginForm.password"
      :error-message="validationErrors.password"
      mandatory-field
    />

    <!-- Session persistence option -->
    <p class="remember-section">
      <label>
        <input type="checkbox" v-model="loginForm.persistSession" />
        <span>Keep me signed in</span>
      </label>
    </p>

    <template #footer>
      <p>
        <a href="#" class="teal-text">Forgot your password?</a>
      </p>
      <p>
        Need an account?
        <router-link to="/register" class="teal-text">Create one here</router-link>
      </p>
    </template>
  </FormCard>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateEmail, validateRequired } from '@/utils/validation'
import FormCard from '@/components/form/FormCard.vue'
import FormField from '@/components/form/FormField.vue'

const router = useRouter()
const route = useRoute()
const { login, loading, error: authError, clearError } = useAuth()

const loginForm = reactive({
  email: '',
  password: '',
  persistSession: false
})

const validationErrors = reactive({
  email: null,
  password: null
})

const performFormValidation = () => {
  validationErrors.email = validateEmail(loginForm.email)
  validationErrors.password = validateRequired(loginForm.password, 'Password')

  return !validationErrors.email && !validationErrors.password
}

const processLogin = async () => {
  clearError()

  if (!performFormValidation()) {
    return
  }

  try {
    await login(loginForm.email, loginForm.password)

    console.log('Login successful, authentication state will handle navigation')

    // Let the requireGuest guard handle the navigation automatically
    // The guard will redirect to the appropriate dashboard based on user role

  } catch (error) {
    console.error('Authentication failed:', error)
  }
}

onMounted(() => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      // Initialize text fields
      M.updateTextFields()

      // Initialize character counters
      M.CharacterCounter.init(document.querySelectorAll('input[data-length]'))
    }, 150)
  }
})
</script>

<style scoped>
.remember-section {
  margin: 1.5rem 0;
}

.remember-section label {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #666;
}

.remember-section input[type="checkbox"] {
  margin-right: 0.5rem;
}
</style>
