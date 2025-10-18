<template>
  <div class="container" style="margin-top: 2rem;">
    <div class="row">
      <div class="col s12 m8 offset-m2">
        <div class="card">
          <div class="card-content">
            <span class="card-title">Form Field Test</span>
            
            <FormField
              element-identifier="test-email"
              label-text="Email Address"
              input-category="email"
              icon-symbol="email"
              v-model="testForm.email"
              mandatory-field
            />
            
            <FormField
              element-identifier="test-password"
              label-text="Password"
              input-category="password"
              icon-symbol="lock"
              v-model="testForm.password"
              mandatory-field
            />
            
            <FormField
              element-identifier="test-name"
              label-text="Full Name"
              icon-symbol="person"
              v-model="testForm.name"
              mandatory-field
            />
            
            <FormField
              element-identifier="test-age"
              label-text="Age"
              input-category="number"
              icon-symbol="cake"
              v-model="testForm.age"
              mandatory-field
            />
            
            <FormField
              element-identifier="test-confirm-password"
              label-text="Confirm Password"
              input-category="password"
              icon-symbol="lock_outline"
              v-model="testForm.confirmPassword"
              :error-message="passwordMatchError"
              mandatory-field
            />

            <div class="card-panel grey lighten-4">
              <h6>Current Values:</h6>
              <p><strong>Email:</strong> {{ testForm.email || 'Empty' }}</p>
              <p><strong>Password:</strong> {{ testForm.password || 'Empty' }}</p>
              <p><strong>Confirm Password:</strong> {{ testForm.confirmPassword || 'Empty' }}</p>
              <p><strong>Name:</strong> {{ testForm.name || 'Empty' }}</p>
              <p><strong>Age:</strong> {{ testForm.age || 'Empty' }}</p>
              <p><strong>Passwords Match:</strong> {{ passwordsMatch ? 'Yes' : 'No' }}</p>
              <p v-if="passwordMatchError" class="red-text"><strong>Error:</strong> {{ passwordMatchError }}</p>
            </div>
            
            <div class="center-align">
              <button @click="clearForm" class="btn waves-effect waves-light red">
                <i class="material-icons left">clear</i>
                Clear Form
              </button>
              <button @click="fillForm" class="btn waves-effect waves-light blue" style="margin-left: 1rem;">
                <i class="material-icons left">edit</i>
                Fill Test Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import FormField from './FormField.vue'
import { validateConfirmPassword } from '@/utils/validation'

const testForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: ''
})

const passwordsMatch = computed(() => {
  return testForm.password === testForm.confirmPassword && testForm.password !== ''
})

const passwordMatchError = computed(() => {
  if (!testForm.confirmPassword) return null
  return validateConfirmPassword(testForm.password, testForm.confirmPassword)
})

const clearForm = () => {
  testForm.email = ''
  testForm.password = ''
  testForm.confirmPassword = ''
  testForm.name = ''
  testForm.age = ''
}

const fillForm = () => {
  testForm.email = 'test@example.com'
  testForm.password = 'TestPass123!'
  testForm.confirmPassword = 'TestPass123!'
  testForm.name = 'John Doe'
  testForm.age = '25'
}
</script>
