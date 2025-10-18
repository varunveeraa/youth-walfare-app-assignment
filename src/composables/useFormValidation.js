import { reactive, computed } from 'vue'
import * as validators from '@/utils/validation'

export const useFormValidation = (formData, validationRules) => {
  const errors = reactive({})
  
  // Validate a single field
  const validateField = (fieldName, value = null) => {
    const fieldValue = value !== null ? value : formData[fieldName]
    const rules = validationRules[fieldName]
    
    if (!rules) {
      errors[fieldName] = null
      return true
    }
    
    // Handle array of validation rules
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = executeValidationRule(rule, fieldValue, fieldName)
        if (error) {
          errors[fieldName] = error
          return false
        }
      }
    } else {
      // Single validation rule
      const error = executeValidationRule(rules, fieldValue, fieldName)
      if (error) {
        errors[fieldName] = error
        return false
      }
    }
    
    errors[fieldName] = null
    return true
  }
  
  // Execute a single validation rule
  const executeValidationRule = (rule, value, fieldName) => {
    if (typeof rule === 'function') {
      return rule(value, fieldName, formData)
    }

    if (typeof rule === 'object') {
      const { validator, message, ...params } = rule
      const validatorFn = typeof validator === 'string' ? validators[validator] : validator

      // For custom validator functions, pass formData; for string validators, don't
      if (typeof validator === 'function') {
        const error = validatorFn(value, fieldName, formData)
        return error ? (message || error) : null
      } else {
        const error = validatorFn(value, fieldName)
        return error ? (message || error) : null
      }
    }

    // String rule - assume it's a validator function name
    if (typeof rule === 'string') {
      const validatorFn = validators[rule]
      return validatorFn ? validatorFn(value, fieldName) : null
    }

    return null
  }
  
  // Validate all fields
  const validateForm = () => {
    let isValid = true
    
    for (const fieldName in validationRules) {
      if (!validateField(fieldName)) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  // Clear all errors
  const clearErrors = () => {
    for (const key in errors) {
      errors[key] = null
    }
  }
  
  // Clear specific field error
  const clearFieldError = (fieldName) => {
    errors[fieldName] = null
  }
  
  // Check if form has any errors
  const hasErrors = computed(() => {
    return Object.values(errors).some(error => error !== null)
  })
  
  // Get first error message
  const firstError = computed(() => {
    for (const error of Object.values(errors)) {
      if (error) return error
    }
    return null
  })
  
  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    hasErrors,
    firstError
  }
}

// Common validation rule presets
export const commonRules = {
  email: [
    { validator: 'validateRequired', message: 'Email is required' },
    { validator: 'validateEmail', message: 'Please enter a valid email address' }
  ],
  password: [
    { validator: 'validateRequired', message: 'Password is required' },
    { validator: 'validatePassword', message: 'Password must be at least 6 characters long' }
  ],
  confirmPassword: (passwordField = 'password') => [
    { validator: 'validateRequired', message: 'Please confirm your password' },
    {
      validator: (value, fieldName, formData) => validators.validateConfirmPassword(formData[passwordField], value),
      message: 'Passwords do not match'
    }
  ],
  required: (fieldLabel) => [
    { validator: 'validateRequired', message: `${fieldLabel} is required` }
  ],
  name: [
    { validator: 'validateRequired', message: 'Name is required' },
    { validator: 'validateName', message: 'Please enter a valid name' }
  ],
  age: [
    { validator: 'validateRequired', message: 'Age is required' },
    { validator: 'validateAge', message: 'Please enter a valid age' }
  ]
}
