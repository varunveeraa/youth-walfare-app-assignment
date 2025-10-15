<template>
  <footer class="page-footer teal darken-2">
    <div class="container">
      <div class="row">
        <div class="col s12 center-align">
          <h5 class="white-text">MindBridge</h5>
          <p class="grey-text text-lighten-4">
            Connecting young people with mental health support and community.
            Your wellbeing is our priority.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Crisis Support Banner -->
    <div class="red darken-2" style="padding: 10px 0;">
      <div class="container">
        <div class="row">
          <div class="col s12 center-align">
            <span class="white-text">
              <i class="material-icons left">warning</i>
              <strong>Crisis Support:</strong> If you're in immediate danger, call emergency services.
              <a href="tel:988" class="yellow-text text-accent-2"><strong>988 Suicide & Crisis Lifeline</strong></a>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer-copyright">
      <div class="container">
        <div class="row">
          <div class="col s12 m6">
            © {{ currentYear }} MindBridge. All rights reserved.
          </div>
          <div class="col s12 m6 right-align">
            <span class="grey-text text-lighten-4">
              Made with <i class="material-icons tiny red-text">favorite</i> for youth mental health
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.page-footer {
  margin-top: auto;
}

.page-footer ul li a:hover {
  text-decoration: underline;
}

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
}

@media only screen and (max-width: 600px) {
  .footer-copyright .row .col.right-align {
    text-align: center !important;
  }
}
</style>
