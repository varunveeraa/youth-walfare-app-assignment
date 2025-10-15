<template>
  <div class="register center-content">
    <div class="container">
      <div class="row">
        <div class="col s12 m10 offset-m1 l8 offset-l2">
          <div class="card-panel">
            <div class="center-align">
              <i class="material-icons large teal-text">person_add</i>
              <h4>Join MindBridge</h4>
              <p class="grey-text">Create your account to get started</p>
            </div>
            
            <form @submit.prevent="handleRegister">
              <div class="row">
                <!-- Display Name -->
                <div class="input-field col s12 m6">
                  <i class="material-icons prefix">person</i>
                  <input 
                    id="displayName" 
                    type="text" 
                    v-model="form.displayName"
                    :class="{ invalid: errors.displayName }"
                    required
                  >
                  <label for="displayName">Full Name</label>
                  <span v-if="errors.displayName" class="helper-text error-text">
                    {{ errors.displayName }}
                  </span>
                </div>
                
                <!-- Email -->
                <div class="input-field col s12 m6">
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
              </div>
              
              <div class="row">
                <!-- Password -->
                <div class="input-field col s12 m6">
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
                
                <!-- Confirm Password -->
                <div class="input-field col s12 m6">
                  <i class="material-icons prefix">lock_outline</i>
                  <input 
                    id="confirmPassword" 
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="form.confirmPassword"
                    :class="{ invalid: errors.confirmPassword }"
                    required
                  >
                  <label for="confirmPassword">Confirm Password</label>
                  <i 
                    class="material-icons suffix password-toggle" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
                  </i>
                  <span v-if="errors.confirmPassword" class="helper-text error-text">
                    {{ errors.confirmPassword }}
                  </span>
                </div>
              </div>
              
              <div class="row">
                <!-- Age -->
                <div class="input-field col s12 m6">
                  <i class="material-icons prefix">cake</i>
                  <input 
                    id="age" 
                    type="number" 
                    v-model="form.age"
                    :class="{ invalid: errors.age }"
                    min="13"
                    max="100"
                    required
                  >
                  <label for="age">Age</label>
                  <span v-if="errors.age" class="helper-text error-text">
                    {{ errors.age }}
                  </span>
                </div>
                
                <!-- Role Selection -->
                <div class="input-field col s12 m6">
                  <i class="material-icons prefix">assignment_ind</i>
                  <select v-model="form.role" :class="{ invalid: errors.role }" required>
                    <option value="" disabled>Choose your role</option>
                    <option value="youth">Youth User</option>
                    <option value="counsellor">Counsellor</option>
                  </select>
                  <label>I am a...</label>
                  <span v-if="errors.role" class="helper-text error-text">
                    {{ errors.role }}
                  </span>
                </div>
              </div>
              
              <!-- Terms and Conditions -->
              <p>
                <label>
                  <input type="checkbox" v-model="form.agreeToTerms" />
                  <span>
                    I agree to the 
                    <a href="#" class="teal-text">Terms of Service</a> 
                    and 
                    <a href="#" class="teal-text">Privacy Policy</a>
                  </span>
                </label>
              </p>
              <span v-if="errors.agreeToTerms" class="error-text">
                {{ errors.agreeToTerms }}
              </span>
              
              <!-- Error Message -->
              <div v-if="authError" class="card-panel red lighten-4 red-text text-darken-2">
                <i class="material-icons left">error</i>
                {{ authError }}
              </div>
              
              <!-- Test Button (for debugging) -->
              <div class="center-align" style="margin-bottom: 1rem;">
                <button
                  @click="testFirebaseConnection"
                  type="button"
                  class="btn waves-effect waves-light blue"
                >
                  <i class="material-icons left">cloud</i>
                  Test Firebase Connection
                </button>
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
                    Creating Account...
                  </span>
                  <span v-else>
                    <i class="material-icons left">person_add</i>
                    Create Account
                  </span>
                </button>
              </div>
            </form>
            
            <!-- Additional Links -->
            <div class="center-align" style="margin-top: 2rem;">
              <p>
                Already have an account? 
                <router-link to="/login" class="teal-text">Sign in here</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { auth, db } from '@/firebase/config'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateAge,
  validateRequired
} from '@/utils/validation'

const router = useRouter()
const { register, loading, error: authError, clearError } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  role: '',
  agreeToTerms: false
})

const errors = reactive({
  displayName: null,
  email: null,
  password: null,
  confirmPassword: null,
  age: null,
  role: null,
  agreeToTerms: null
})

const validateForm = () => {
  errors.displayName = validateName(form.displayName)
  errors.email = validateEmail(form.email)
  errors.password = validatePassword(form.password)
  errors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword)
  errors.age = validateAge(form.age)
  errors.role = validateRequired(form.role, 'Role')
  errors.agreeToTerms = form.agreeToTerms ? null : 'You must agree to the terms and conditions'
  
  return !Object.values(errors).some(error => error !== null)
}

const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...')

    // Test Firebase Auth
    console.log('Firebase Auth instance:', auth)
    console.log('Firebase Auth current user:', auth.currentUser)

    // Test Firestore
    console.log('Firestore instance:', db)

    alert('Firebase connection test completed. Check console for details.')
  } catch (error) {
    console.error('Firebase connection test failed:', error)
    alert('Firebase connection test failed. Check console for details.')
  }
}

const handleRegister = async () => {
  clearError()

  if (!validateForm()) {
    return
  }

  try {
    const userData = {
      displayName: form.displayName,
      age: parseInt(form.age),
      role: form.role
    }

    await register(form.email, form.password, userData)

    // Redirect to dashboard after successful registration
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration error:', error)
    // Error is handled by the useAuth composable
  }
}

onMounted(() => {
  // Initialize Materialize select
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      M.FormSelect.init(document.querySelectorAll('select'))
    }, 100)
  }
})
</script>

<style scoped>
.register {
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
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
