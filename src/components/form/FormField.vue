<template>
  <div class="input-field">
    <i v-if="icon" class="material-icons prefix">{{ icon }}</i>
    <input 
      :id="id"
      :type="computedType"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="{ invalid: error }"
      :required="required"
      :placeholder="placeholder"
      class="validate"
    >
    <label :for="id">{{ label }}</label>
    
    <!-- Password toggle for password fields -->
    <i 
      v-if="type === 'password'"
      class="material-icons suffix password-toggle" 
      @click="togglePassword"
    >
      {{ showPassword ? 'visibility_off' : 'visibility' }}
    </i>
    
    <!-- Error message -->
    <span v-if="error" class="helper-text error-text">
      {{ error }}
    </span>
    
    <!-- Helper text -->
    <span v-else-if="helperText" class="helper-text">
      {{ helperText }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  modelValue: { type: [String, Number], default: '' },
  icon: { type: String, default: null },
  error: { type: String, default: null },
  helperText: { type: String, default: null },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
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
</style>
