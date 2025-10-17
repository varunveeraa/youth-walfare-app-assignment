<template>
  <div class="center-content">
    <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="card-panel">
            <!-- Header -->
            <div class="center-align">
              <i v-if="icon" class="material-icons large teal-text">{{ icon }}</i>
              <h4>{{ title }}</h4>
              <p v-if="subtitle" class="grey-text">{{ subtitle }}</p>
            </div>
            
            <!-- Form Content -->
            <form @submit.prevent="$emit('submit')">
              <slot />
              
              <!-- Error Message -->
              <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
                <i class="material-icons left">error</i>
                {{ error }}
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
                    {{ loadingText }}
                  </span>
                  <span v-else>
                    <i v-if="submitIcon" class="material-icons left">{{ submitIcon }}</i>
                    {{ submitText }}
                  </span>
                </button>
              </div>
            </form>
            
            <!-- Footer Links -->
            <div v-if="$slots.footer" class="center-align" style="margin-top: 2rem;">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: null },
  icon: { type: String, default: null },
  error: { type: String, default: null },
  loading: { type: Boolean, default: false },
  submitText: { type: String, required: true },
  submitIcon: { type: String, default: null },
  loadingText: { type: String, default: 'Loading...' }
})

defineEmits(['submit'])
</script>

<style scoped>
.center-content {
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card-panel {
  padding: 2rem;
  border-radius: 8px;
}

.material-icons.large {
  font-size: 4rem;
  margin-bottom: 1rem;
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
