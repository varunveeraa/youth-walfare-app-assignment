<script setup>
import { onMounted, nextTick } from 'vue'
import NavigationHeader from '@/components/layout/AppHeader.vue'
import ApplicationFooter from '@/components/layout/AppFooter.vue'
import { useAuth } from '@/composables/useAuth'
import { useAccessibility } from '@/composables/useAccessibility'

// Initialize authentication management system
const { initAuth: initializeAuthenticationMonitoring } = useAuth()

// Initialize accessibility features
const { announcements } = useAccessibility()

const bootstrapApplicationComponents = async () => {
  // Ensure DOM is ready before initializing components
  await nextTick()

  // Initialize Materialize CSS framework components
  if (typeof M !== 'undefined') {
    M.AutoInit()
  }

  // Establish authentication state monitoring
  initializeAuthenticationMonitoring()
}

onMounted(() => {
  bootstrapApplicationComponents()
})
</script>

<template>
  <div id="app" class="application-container full-height flex-layout">
    <!-- Accessibility: Skip links -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Accessibility: Screen reader announcements -->
    <div
      id="sr-announcements"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcements }}
    </div>

    <NavigationHeader />

    <main id="main-content" class="content-area flex-expand" role="main" tabindex="-1">
      <router-view />
    </main>

    <ApplicationFooter />
  </div>
</template>

<style>
/* Materialize CSS framework import */
@import 'materialize-css/dist/css/materialize.min.css';

/* Google Material Icons font */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Base application styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.application-container {
  min-height: 100vh;
}

.full-height {
  min-height: 100vh;
}

.flex-layout {
  display: flex;
  flex-direction: column;
}

.content-area {
  flex-grow: 1;
}

.flex-expand {
  flex-grow: 1;
}

/* Utility classes for layout */
.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.card-panel {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn {
  border-radius: 6px;
  font-weight: 500;
}

/* Accessibility: Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #26a69a;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-weight: 500;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* Accessibility: Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Accessibility: Enhanced focus indicators */
*:focus {
  outline: 2px solid #26a69a;
  outline-offset: 2px;
}

/* Remove outline for mouse users, keep for keyboard users */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #26a69a;
  outline-offset: 2px;
}

/* Enhanced form styling */
.input-field input:focus + label {
  color: #26a69a !important;
}

.input-field input:focus {
  border-bottom: 2px solid #26a69a !important;
  box-shadow: 0 1px 0 0 #26a69a !important;
}

/* Status message styling */
.error-text {
  color: #f44336 !important;
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 500;
}

.success-text {
  color: #4caf50 !important;
  font-weight: 500;
}

/* Loading indicator */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
}

/* Mobile responsiveness */
@media only screen and (max-width: 600px) {
  .container {
    width: 95%;
  }

  .card-panel {
    margin: 0.75rem;
  }

  .btn {
    font-size: 0.9rem;
  }
}

@media only screen and (max-width: 480px) {
  .card-panel {
    margin: 0.5rem;
    padding: 1.5rem;
  }
}
</style>
