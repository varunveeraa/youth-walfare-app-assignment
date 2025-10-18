<template>
  <div class="form-container-wrapper">
    <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="form-card-panel">
            <!-- Header Section -->
            <div class="form-header center-align" @mouseenter="handleCardHover" @mouseleave="handleCardLeave">
              <i v-if="headerIcon" class="material-icons large teal-text">{{ headerIcon }}</i>
              <h4 class="form-title">{{ cardTitle }}</h4>
              <p v-if="cardSubheading" class="grey-text form-subtitle">{{ cardSubheading }}</p>
            </div>

            <!-- Main Form Area -->
            <form @submit.prevent="emitEvents('submit')" class="form-content">
              <slot />

              <!-- Error Display -->
              <div v-if="systemNotification" class="error-notification card-panel red lighten-4 red-text text-darken-2">
                <i class="material-icons left">error_outline</i>
                {{ systemNotification }}
              </div>

              <!-- Action Button -->
              <div class="form-actions center-align">
                <button
                  type="submit"
                  class="btn-large waves-effect waves-light teal form-submit-btn"
                  :disabled="operationActive"
                >
                  <span v-if="operationActive">
                    <i class="material-icons left">hourglass_empty</i>
                    {{ loadingLabel }}
                  </span>
                  <span v-else>
                    <i v-if="submitIconSymbol" class="material-icons left">{{ submitIconSymbol }}</i>
                    {{ submitLabel }}
                  </span>
                </button>
              </div>
            </form>

            <!-- Additional Links -->
            <div v-if="$slots.footer" class="form-footer center-align">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  cardTitle: { type: String, required: true },
  cardSubheading: { type: String, default: null },
  headerIcon: { type: String, default: null },
  systemNotification: { type: String, default: null },
  operationActive: { type: Boolean, default: false },
  submitLabel: { type: String, required: true },
  submitIconSymbol: { type: String, default: null },
  loadingLabel: { type: String, default: 'Processing...' }
})

const emitEvents = defineEmits(['submit'])

const cardInteractionState = ref('idle')

const dynamicSubmitText = computed(() => {
  return props.operationActive ? props.loadingLabel : props.submitLabel
})

const dynamicSubmitIcon = computed(() => {
  return props.operationActive ? 'hourglass_empty' : props.submitIconSymbol
})

const handleCardHover = () => {
  cardInteractionState.value = 'hover'
}

const handleCardLeave = () => {
  cardInteractionState.value = 'idle'
}
</script>

<style scoped>
.form-container-wrapper {
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card-panel {
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  margin: 1rem 0 0.5rem 0;
  font-weight: 500;
}

.form-subtitle {
  margin-bottom: 0;
  font-size: 1.1rem;
}

.material-icons.large {
  font-size: 4.5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.form-submit-btn {
  width: 100%;
  margin-top: 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.form-footer {
  margin-top: 2.5rem;
}

.error-notification {
  margin: 1.5rem 0;
  border-radius: 8px;
  padding: 1rem;
}

@media only screen and (max-width: 600px) {
  .form-card-panel {
    margin: 1rem 0.5rem;
    padding: 2rem;
  }

  .form-title {
    font-size: 1.8rem;
  }
}
</style>
