<template>
  <div class="input-field" :class="{ 'has-prefix': iconSymbol }">
    <i
      v-if="iconSymbol"
      class="material-icons prefix"
      :class="{ 'active': modelValue }"
      aria-hidden="true"
    >
      {{ iconSymbol }}
    </i>
    <input
      :id="elementIdentifier"
      :type="computedInputType"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      class="validate"
      :class="{ 'invalid': !!errorMessage }"
      :required="mandatoryField"
      :aria-required="mandatoryField"
      :aria-invalid="!!errorMessage"
      :aria-describedby="getAriaDescribedBy"
      :aria-label="ariaLabel || labelText"
      autocomplete="off"
    >
    <label :for="elementIdentifier" :class="{ 'active': modelValue }">{{ labelText }}</label>

    <button
      v-if="inputCategory === 'password'"
      type="button"
      class="password-toggle-btn"
      @click="togglePassword"
      @keydown="handleToggleKeydown"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      :aria-pressed="showPassword"
      tabindex="0"
    >
      <i class="material-icons suffix password-toggle" aria-hidden="true">
        {{ showPassword ? 'visibility_off' : 'visibility' }}
      </i>
    </button>

    <span
      v-if="errorMessage"
      :id="`${elementIdentifier}-error`"
      class="helper-text error-text"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </span>
    <span
      v-else-if="helpText"
      :id="`${elementIdentifier}-help`"
      class="helper-text"
    >
      {{ helpText }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  elementIdentifier: String,
  labelText: String,
  inputCategory: { type: String, default: 'text' },
  modelValue: [String, Number],
  iconSymbol: String,
  errorMessage: String,
  helpText: String,
  mandatoryField: Boolean,
  hintText: String,
  ariaLabel: String
})

const $emit = defineEmits(['update:modelValue', 'keydown'])

const showPassword = ref(false)

const computedInputType = computed(() => {
  if (props.inputCategory === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.inputCategory
})

// Accessibility: Compute aria-describedby value
const getAriaDescribedBy = computed(() => {
  const describedBy = []
  if (props.errorMessage) {
    describedBy.push(`${props.elementIdentifier}-error`)
  }
  if (props.helpText) {
    describedBy.push(`${props.elementIdentifier}-help`)
  }
  return describedBy.length > 0 ? describedBy.join(' ') : undefined
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Accessibility: Keyboard event handlers
const handleKeydown = (event) => {
  // Allow normal input behavior
  // Emit keydown event for parent components if needed
  $emit('keydown', event)
}

const handleToggleKeydown = (event) => {
  // Handle Enter and Space keys for password toggle
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    togglePassword()
  }
}

// Handle input events with proper debouncing
const handleInput = (event) => {
  const value = event.target.value
  $emit('update:modelValue', value)

  // Update Materialize labels immediately
  nextTick(() => {
    if (typeof M !== 'undefined') {
      M.updateTextFields()
    }
  })
}

// Handle focus events
const handleFocus = () => {
  nextTick(() => {
    if (typeof M !== 'undefined') {
      M.updateTextFields()
    }
  })
}

// Handle blur events
const handleBlur = () => {
  nextTick(() => {
    if (typeof M !== 'undefined') {
      M.updateTextFields()
    }
  })
}

// Initialize Materialize CSS for input fields
const initializeMaterialize = () => {
  if (typeof M !== 'undefined') {
    nextTick(() => {
      // Update labels for inputs with values
      M.updateTextFields()

      // Initialize character counter if needed
      const inputElement = document.getElementById(props.elementIdentifier)
      if (inputElement) {
        M.CharacterCounter.init(inputElement)
      }
    })
  }
}

// Watch for value changes to update Materialize labels
watch(() => props.modelValue, () => {
  initializeMaterialize()
}, { immediate: true })

onMounted(() => {
  initializeMaterialize()
})
</script>

<style scoped>
.input-field {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-field input {
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #9e9e9e;
  border-radius: 0;
  outline: none;
  height: 3rem;
  width: 100%;
  font-size: 16px;
  margin: 0 0 8px 0;
  padding: 0;
  box-shadow: none;
  box-sizing: content-box;
  transition: box-shadow .3s, border .3s;
}

.input-field input:focus {
  border-bottom: 1px solid #26a69a;
  box-shadow: 0 1px 0 0 #26a69a;
}

.input-field input.invalid {
  border-bottom: 1px solid #f44336;
  box-shadow: 0 1px 0 0 #f44336;
}

.input-field label {
  color: #9e9e9e;
  position: absolute;
  top: 0;
  left: 0;
  font-size: 1rem;
  cursor: text;
  transition: transform .2s ease-out, color .2s ease-out;
  transform-origin: 0% 100%;
  text-align: initial;
  transform: translateY(12px);
}

.input-field label.active {
  transform: translateY(-14px) scale(0.8);
  color: #26a69a;
}

.input-field input:focus + label,
.input-field input.valid + label,
.input-field input:not(:placeholder-shown) + label {
  transform: translateY(-14px) scale(0.8);
  color: #26a69a;
}

.input-field input.invalid + label {
  color: #f44336;
}

.input-field .prefix {
  position: absolute;
  width: 3rem;
  font-size: 2rem;
  transition: color .2s;
  top: 0.5rem;
}

.input-field .prefix.active {
  color: #26a69a;
}

.input-field input[type=text]:focus + label,
.input-field input[type=password]:focus + label,
.input-field input[type=email]:focus + label,
.input-field input[type=number]:focus + label {
  color: #26a69a;
}

/* Accessibility: Password toggle button */
.password-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.password-toggle-btn:hover {
  background-color: rgba(38, 166, 154, 0.1);
}

.password-toggle-btn:focus {
  outline: 2px solid #26a69a;
  outline-offset: 2px;
  background-color: rgba(38, 166, 154, 0.1);
}

.password-toggle {
  cursor: pointer;
  user-select: none;
  font-size: 2rem;
  color: #9e9e9e;
  transition: color .2s;
}

.password-toggle-btn:hover .password-toggle,
.password-toggle-btn:focus .password-toggle {
  color: #26a69a;
}

/* Accessibility: Enhanced focus indicators */
.input-field input:focus {
  outline: 2px solid #26a69a;
  outline-offset: 2px;
}

/* Accessibility: Error text styling */
.error-text {
  color: #f44336 !important;
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 500;
}

.helper-text {
  font-size: 0.8rem;
  color: #f44336;
  display: block;
  margin-top: 4px;
  min-height: 18px;
}

/* Ensure proper spacing with prefix icons */
.input-field.has-prefix input {
  margin-left: 3rem;
  width: calc(100% - 3rem);
}

.input-field.has-prefix label {
  margin-left: 3rem;
}

/* Mobile responsiveness */
@media only screen and (max-width: 600px) {
  .input-field input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
