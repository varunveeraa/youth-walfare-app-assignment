// Validation utilities for form inputs

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return 'Email is required'
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)'
  }
  return null
}

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

// Name validation
export const validateName = (name) => {
  if (!name) {
    return 'Name is required'
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters long'
  }
  if (name.length > 50) {
    return 'Name must be less than 50 characters'
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces'
  }
  return null
}

// Age validation
export const validateAge = (age) => {
  if (!age) {
    return 'Age is required'
  }
  const ageNum = parseInt(age)
  if (isNaN(ageNum)) {
    return 'Age must be a number'
  }
  if (ageNum < 13) {
    return 'You must be at least 13 years old to use this platform'
  }
  if (ageNum > 100) {
    return 'Please enter a valid age'
  }
  return null
}

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number is required'
  }
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number'
  }
  return null
}

// Text content validation (for posts, comments)
export const validateTextContent = (content, minLength = 1, maxLength = 1000) => {
  if (!content || content.trim().length === 0) {
    return 'Content cannot be empty'
  }
  if (content.trim().length < minLength) {
    return `Content must be at least ${minLength} characters long`
  }
  if (content.length > maxLength) {
    return `Content must be less than ${maxLength} characters`
  }
  return null
}

// Rating validation
export const validateRating = (rating) => {
  if (!rating) {
    return 'Rating is required'
  }
  const ratingNum = parseInt(rating)
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return 'Rating must be between 1 and 5'
  }
  return null
}

// Generic required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} is required`
  }
  return null
}

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Validate and sanitize user input
export const validateAndSanitize = (input, validator) => {
  if (typeof input === 'string') {
    input = sanitizeHtml(input.trim())
  }
  const error = validator(input)
  return { value: input, error }
}
