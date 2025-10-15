<template>
  <div class="login center-content">
    <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="card-panel">
            <div class="center-align">
              <i class="material-icons large teal-text">account_circle</i>
              <h4>Welcome Back</h4>
              <p class="grey-text">Sign in to your MindBridge account</p>
            </div>
            
            <form @submit.prevent="handleLogin">
              <!-- Email Field -->
              <div class="input-field">
                <i class="material-icons prefix">email</i>
                <input 
                  id="email" 
                  type="email" 
                  v-model="form.email"
                  :class="{ invalid: errors.email }"
                  required
                >
                <label for="email">Email</label>
                <span v-if="errors.email" class="helper-text error-text">
                  {{ errors.email }}
                </span>
              </div>
              
              <!-- Password Field -->
              <div class="input-field">
                <i class="material-icons prefix">lock</i>
                <input 
                  id="password" 
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  :class="{ invalid: errors.password }"
                  required
                >
                <label for="password">Password</label>
                <i 
                  class="material-icons suffix password-toggle" 
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </i>
                <span v-if="errors.password" class="helper-text error-text">
                  {{ errors.password }}
                </span>
              </div>
              
              <!-- Remember Me -->
              <p>
                <label>
                  <input type="checkbox" v-model="form.rememberMe" />
                  <span>Remember me</span>
                </label>
              </p>
              
              <!-- Error Message -->
              <div v-if="authError" class="card-panel red lighten-4 red-text text-darken-2">
                <i class="material-icons left">error</i>
                {{ authError }}
              </div>
              
              <!-- Submit Button -->
              <div class="center-align">
                <button 
                  type="submit" 
                  class="btn-large waves-effect waves-light teal"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <i class="material-icons left">hourglass_empty</i>
                    Signing In...
                  </span>
                  <span v-else>
                    <i class="material-icons left">login</i>
                    Sign In
                  </span>
                </button>
              </div>
            </form>
            
            <!-- Additional Links -->
            <div class="center-align" style="margin-top: 2rem;">
              <p>
                <a href="#" class="teal-text">Forgot your password?</a>
              </p>
              <p>
                Don't have an account? 
                <router-link to="/register" class="teal-text">Sign up here</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateEmail, validateRequired } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const { login, loading, error: authError, clearError } = useAuth()

const showPassword = ref(false)

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
    
    // Redirect to intended page or dashboard
    const redirectTo = route.query.redirect || '/dashboard'
    router.push(redirectTo)
  } catch (error) {
    console.error('Login error:', error)
    // Error is handled by the useAuth composable
  }
}
</script>

<style scoped>
.login {
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card-panel {
  padding: 2rem;
  border-radius: 8px;
}

.material-icons.large {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.password-toggle {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  padding: 1rem;
}

.input-field {
  position: relative;
}

.suffix {
  position: absolute;
  right: 0;
  top: 0;
}

.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
}

.btn-large {
  width: 100%;
  margin-top: 1rem;
}

@media only screen and (max-width: 600px) {
  .card-panel {
    margin: 1rem 0.5rem;
    padding: 1.5rem;
  }
}
</style>
