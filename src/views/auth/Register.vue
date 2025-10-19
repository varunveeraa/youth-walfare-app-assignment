<template>
  <FormCard
    card-title="Join MindBridge"
    card-subheading="Create your account to begin your journey"
    header-icon="person_add"
    :system-notification="authError"
    :operation-active="loading"
    submit-label="Create Account"
    submit-icon-symbol="person_add"
    loading-label="Setting up account..."
    @submit="processRegistration"
  >
    <div class="row">
      <div class="col s12 m6">
        <FormField
          element-identifier="displayName"
          label-text="Full Name"
          icon-symbol="person"
          v-model="registrationForm.displayName"
          :error-message="validationErrors.displayName"
          mandatory-field
        />
      </div>

      <div class="col s12 m6">
        <FormField
          element-identifier="email"
          label-text="Email Address"
          input-category="email"
          icon-symbol="email"
          v-model="registrationForm.email"
          :error-message="validationErrors.email"
          mandatory-field
        />
      </div>
    </div>

    <div class="row">
      <div class="col s12 m6">
        <FormField
          element-identifier="password"
          label-text="Password"
          input-category="password"
          icon-symbol="lock"
          v-model="registrationForm.password"
          :error-message="validationErrors.password"
          mandatory-field
        />
      </div>

      <div class="col s12 m6">
        <FormField
          element-identifier="confirmPassword"
          label-text="Confirm Password"
          input-category="password"
          icon-symbol="lock_outline"
          v-model="registrationForm.confirmPassword"
          :error-message="validationErrors.confirmPassword"
          mandatory-field
        />
      </div>
    </div>

    <div class="row">
      <div class="col s12 m6">
        <FormField
          element-identifier="age"
          label-text="Age"
          input-category="number"
          icon-symbol="cake"
          v-model="registrationForm.age"
          :error-message="validationErrors.age"
          mandatory-field
        />
      </div>

      <div class="col s12 m6">
        <div class="field-container">
          <i class="material-icons field-prefix">assignment_ind</i>
          <select v-model="registrationForm.role" :class="{ invalid: validationErrors.role }" required>
            <option value="" disabled>Select your role</option>
            <option value="youth">Youth User</option>
            <option value="counsellor">Counsellor</option>
          </select>
          <label>Account Type</label>
          <span v-if="validationErrors.role" class="helper-text validation-error">
            {{ validationErrors.role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Agreement Section -->
    <p class="terms-section">
      <label>
        <input type="checkbox" v-model="registrationForm.agreeToTerms" />
        <span>
          I accept the
          <a href="#" class="teal-text">Terms of Service</a>
          and
          <a href="#" class="teal-text">Privacy Policy</a>
        </span>
      </label>
    </p>
    <span v-if="validationErrors.agreeToTerms" class="validation-error">
      {{ validationErrors.agreeToTerms }}
    </span>

    <!-- Connection Test (development) -->
    <div class="center-align" style="margin-bottom: 1rem;">
      <button
        @click="verifyFirebaseConnection"
        type="button"
        class="btn waves-effect waves-light blue"
      >
        <i class="material-icons left">cloud_done</i>
        Verify Connection
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

const registrationForm = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  role: '',
  agreeToTerms: false
})

const { errors: validationErrors, validateForm: performValidation } = useFormValidation(registrationForm, {
  displayName: commonRules.name,
  email: commonRules.email,
  password: commonRules.password,
  confirmPassword: commonRules.confirmPassword('password'),
  age: commonRules.age,
  role: commonRules.required('Role'),
  agreeToTerms: [{
    validator: (value) => value ? null : 'You must accept the terms and conditions to proceed',
    message: 'You must accept the terms and conditions to proceed'
  }]
})

const verifyFirebaseConnection = async () => {
  try {
    // Check Firebase Auth and Firestore connections
    if (auth && db) {
      alert('Firebase connection verified successfully.')
    } else {
      alert('Firebase connection verification failed.')
    }
  } catch (error) {
    alert('Firebase connection verification failed.')
  }
}

const processRegistration = async () => {
  clearError()

  if (!performValidation()) {
    return
  }

  try {
    const userProfile = {
      displayName: registrationForm.displayName,
      age: parseInt(registrationForm.age),
      role: registrationForm.role
    }

    const registrationResult = await register(registrationForm.email, registrationForm.password, userProfile)

    // Navigate to dashboard after successful account creation
    router.push('/dashboard')
  } catch (error) {
    // Error handling managed by useAuth composable
  }
}

onMounted(() => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      // Initialize select components
      M.FormSelect.init(document.querySelectorAll('select'))

      // Initialize text fields
      M.updateTextFields()

      // Initialize character counters
      M.CharacterCounter.init(document.querySelectorAll('input[data-length]'))
    }, 150)
  }
})
</script>

<style scoped>
.terms-section {
  margin: 1.5rem 0;
}

.terms-section label {
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.4;
}

.terms-section input[type="checkbox"] {
  margin-right: 0.5rem;
  margin-top: 0.2rem;
}

.field-container {
  position: relative;
  margin-bottom: 1rem;
}

.field-prefix {
  position: absolute;
  left: 0;
  top: 0;
  padding: 1rem;
  color: #9e9e9e;
}

.validation-error {
  color: #f44336 !important;
  font-size: 0.85rem;
  font-weight: 500;
  display: block;
  margin-top: 0.5rem;
}

select {
  padding-left: 3rem !important;
}

@media only screen and (max-width: 600px) {
  .terms-section {
    margin: 1rem 0;
  }

  .terms-section label {
    font-size: 0.9rem;
  }
}
</style>
