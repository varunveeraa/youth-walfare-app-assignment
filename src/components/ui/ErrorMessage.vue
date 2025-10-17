<template>
  <div v-if="error" class="error-container">
    <div class="card-panel" :class="colorClass">
      <div class="error-content">
        <i class="material-icons left">{{ icon }}</i>
        <span class="error-text">
          <strong v-if="title">{{ title }}:</strong>
          {{ error }}
        </span>
        <button 
          v-if="dismissible" 
          @click="$emit('dismiss')" 
          class="btn-flat right"
          style="margin: -10px -10px -10px 10px;"
        >
          <i class="material-icons">close</i>
        </button>
      </div>
      
      <!-- Action buttons -->
      <div v-if="showRetry || $slots.actions" class="error-actions">
        <slot name="actions">
          <button v-if="showRetry" @click="$emit('retry')" class="btn waves-effect">
            <i class="material-icons left">refresh</i>
            Try Again
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: [String, Error],
    default: null
  },
  title: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  showRetry: {
    type: Boolean,
    default: false
  }
})

defineEmits(['dismiss', 'retry'])

const typeConfig = {
  error: {
    color: 'red lighten-4 red-text text-darken-2',
    icon: 'error'
  },
  warning: {
    color: 'orange lighten-4 orange-text text-darken-2',
    icon: 'warning'
  },
  info: {
    color: 'blue lighten-4 blue-text text-darken-2',
    icon: 'info'
  }
}

const colorClass = computed(() => typeConfig[props.type].color)
const icon = computed(() => typeConfig[props.type].icon)
</script>

<style scoped>
.error-container {
  margin: 1rem 0;
}

.error-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.error-text {
  flex: 1;
  margin-left: 0.5rem;
}

.error-actions {
  margin-top: 1rem;
  text-align: center;
}

.material-icons.left {
  margin-right: 0.5rem;
}
</style>
