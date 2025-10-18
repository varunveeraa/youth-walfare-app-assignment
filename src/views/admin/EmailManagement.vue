<template>
  <div class="email-management">
    <div class="container">
      <h4 class="center-align">Essential Email System</h4>
      
      <div class="row">
        <!-- Email Configuration Status -->
        <div class="col s12 m6">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Email Configuration</span>
              <div class="collection">
                <div class="collection-item">
                  <span class="title">SendGrid API</span>
                  <span class="secondary-content">
                    <span class="chip green white-text">Active</span>
                  </span>
                </div>
                <div class="collection-item">
                  <span class="title">Sender Email</span>
                  <span class="secondary-content">varunveerbadra@gmail.com</span>
                </div>
                <div class="collection-item">
                  <span class="title">Automated Emails</span>
                  <span class="secondary-content">
                    <span class="chip blue white-text">Enabled</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Testing -->
        <div class="col s12 m6">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Test Email System</span>
              <div class="input-field">
                <input 
                  id="test-email" 
                  type="email" 
                  v-model="testEmail"
                  :disabled="loading"
                >
                <label for="test-email">Test Email Address</label>
              </div>
              <button 
                class="btn waves-effect waves-light" 
                @click="sendTestEmail"
                :disabled="loading || !testEmail"
              >
                <i class="material-icons left">send</i>
                {{ loading ? 'Sending...' : 'Send Test Email' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Types Information -->
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Automated Email Types</span>
              <div class="collection">
                <div class="collection-item">
                  <div class="row">
                    <div class="col s8">
                      <span class="title">Welcome Emails</span>
                      <p class="grey-text">Sent automatically when users register</p>
                    </div>
                    <div class="col s4 right-align">
                      <span class="chip green white-text">Active</span>
                    </div>
                  </div>
                </div>
                <div class="collection-item">
                  <div class="row">
                    <div class="col s8">
                      <span class="title">Appointment Confirmations</span>
                      <p class="grey-text">Sent when appointments are booked</p>
                    </div>
                    <div class="col s4 right-align">
                      <span class="chip green white-text">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="card-panel" :class="messageType === 'success' ? 'green lighten-4' : 'red lighten-4'">
        <span :class="messageType === 'success' ? 'green-text text-darken-2' : 'red-text text-darken-2'">
          {{ message }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEmailService } from '@/composables/useEmailService'

// Reactive data
const testEmail = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('success')

// Email service
const { testEmailService } = useEmailService()

// Methods
const sendTestEmail = async () => {
  if (!testEmail.value) return
  
  loading.value = true
  message.value = ''
  
  try {
    const result = await testEmailService(testEmail.value)
    
    if (result.success) {
      showMessage('Test email sent successfully!', 'success')
      testEmail.value = ''
    } else {
      showMessage('Failed to send test email: ' + result.message, 'error')
    }
  } catch (error) {
    showMessage('Error sending test email: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const showMessage = (msg, type) => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Initialize Materialize components
onMounted(() => {
  // Initialize any Materialize components if needed
  setTimeout(() => {
    if (window.M) {
      window.M.updateTextFields()
    }
  }, 100)
})
</script>

<style scoped>
.email-management {
  padding: 20px 0;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.collection-item .title {
  font-weight: 500;
  font-size: 1.1rem;
}

.chip {
  margin: 0 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-panel {
  margin: 20px 0;
  padding: 15px;
  border-radius: 4px;
}
</style>
