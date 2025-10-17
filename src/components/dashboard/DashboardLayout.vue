<template>
  <div class="dashboard">
    <div class="container">
      <!-- Welcome Section -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel" :class="welcomeColorClass">
            <h4 :class="welcomeTextClass">{{ welcomeTitle }}</h4>
            <p class="grey-text text-darken-1">{{ welcomeMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  welcomeTitle: { type: String, required: true },
  welcomeMessage: { type: String, required: true },
  theme: {
    type: String,
    default: 'teal',
    validator: (value) => ['teal', 'blue', 'red'].includes(value)
  }
})

const themeClasses = {
  teal: { bg: 'teal lighten-5', text: 'teal-text' },
  blue: { bg: 'blue lighten-5', text: 'blue-text' },
  red: { bg: 'red lighten-5', text: 'red-text' }
}

const welcomeColorClass = computed(() => themeClasses[props.theme].bg)
const welcomeTextClass = computed(() => themeClasses[props.theme].text)
</script>

<style scoped>
.dashboard {
  padding: 1rem 0;
}

.card-panel {
  margin: 0.5rem 0;
}
</style>
