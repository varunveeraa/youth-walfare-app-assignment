<template>
  <FormCard
    title="Join MindBridge"
    subtitle="Create your account to get started"
    icon="person_add"
    :error="authError"
    :loading="loading"
    submit-text="Create Account"
    submit-icon="person_add"
    loading-text="Creating Account..."
    @submit="handleRegister"
  >
    <div class="row">
      <div class="col s12 m6">
        <FormField
          id="displayName"
          label="Full Name"
          icon="person"
          v-model="form.displayName"
          :error="errors.displayName"
          required
        />
      </div>

      <div class="col s12 m6">
        <FormField
          id="email"
          label="Email"
          type="email"
          icon="email"
          v-model="form.email"
          :error="errors.email"
          required
        />
      </div>
    </div>

    <div class="row">
      <div class="col s12 m6">
        <FormField
          id="password"
          label="Password"
          type="password"
          icon="lock"
          v-model="form.password"
          :error="errors.password"
          required
        />
      </div>

      <div class="col s12 m6">
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          icon="lock_outline"
          v-model="form.confirmPassword"
          :error="errors.confirmPassword"
          required
        />
      </div>
    </div>

    <div class="row">
      <div class="col s12 m6">
        <FormField
          id="age"
          label="Age"
          type="number"
          icon="cake"
          v-model="form.age"
          :error="errors.age"
          required
        />
      </div>

      <div class="col s12 m6">
        <div class="input-field">
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

    <template #footer>
      <p>
        Already have an account?
        <router-link to="/login" class="teal-text">Sign in here</router-link>
      </p>
    </template>
  </FormCard>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation, commonRules } from '@/composables/useFormValidation'
import { auth, db } from '@/firebase/config'
import FormCard from '@/components/form/FormCard.vue'
import FormField from '@/components/form/FormField.vue'

const router = useRouter()
const { register, loading, error: authError, clearError } = useAuth()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  role: '',
  agreeToTerms: false
})

const { errors, validateForm } = useFormValidation(form, {
  displayName: commonRules.name,
  email: commonRules.email,
  password: commonRules.password,
  confirmPassword: commonRules.confirmPassword('password'),
  age: commonRules.age,
  role: commonRules.required('Role'),
  agreeToTerms: [{
    validator: (value) => value ? null : 'You must agree to the terms and conditions',
    message: 'You must agree to the terms and conditions'
  }]
})



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

    const result = await register(form.email, form.password, userData)

    // Welcome email will be sent automatically via Cloud Functions
    if (result && result.user) {
      console.log('User registered successfully - welcome email will be sent automatically')
    }

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
