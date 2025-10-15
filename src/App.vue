<script setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuth } from '@/composables/useAuth'

// Initialize authentication
const { initAuth } = useAuth()

onMounted(() => {
  // Initialize Materialize CSS
  if (typeof M !== 'undefined') {
    M.AutoInit()
  }

  // Initialize authentication state
  initAuth()
})
</script>

<template>
  <div id="app" class="min-height-100vh flex-column">
    <AppHeader />

    <main class="flex-grow-1">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<style>
/* Import Materialize CSS */
@import 'materialize-css/dist/css/materialize.min.css';

/* Import Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.min-height-100vh {
  min-height: 100vh;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Custom utility classes */
.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.card-panel {
  border-radius: 8px;
}

.btn {
  border-radius: 4px;
}

/* Form styling */
.input-field input:focus + label {
  color: #26a69a !important;
}

.input-field input:focus {
  border-bottom: 1px solid #26a69a !important;
  box-shadow: 0 1px 0 0 #26a69a !important;
}

/* Error styling */
.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Success styling */
.success-text {
  color: #4caf50 !important;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Responsive adjustments */
@media only screen and (max-width: 600px) {
  .container {
    width: 95%;
  }

  .card-panel {
    margin: 0.5rem;
  }
}
</style>
