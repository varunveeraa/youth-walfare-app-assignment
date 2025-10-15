<template>
  <div class="email-management">
    <div class="container">
      <div class="row">
        <div class="col s12">
          <h4>Email Management</h4>
          <p class="grey-text">Test and manage email functionality</p>
        </div>
      </div>

      <!-- Email Testing Section -->
      <div class="row">
        <div class="col s12 m6">
          <div class="card">
            <div class="card-content">
              <span class="card-title">
                <i class="material-icons left">email</i>
                Test Email Service
              </span>
              
              <div class="input-field">
                <i class="material-icons prefix">email</i>
                <input 
                  id="testEmail" 
                  type="email" 
                  v-model="testEmail"
                  :disabled="loading"
                >
                <label for="testEmail">Test Email Address</label>
              </div>

              <div class="input-field">
                <select v-model="emailType" :disabled="loading">
                  <option value="welcome">Welcome Email</option>
                  <option value="appointment">Appointment Confirmation</option>
                  <option value="reminder">Appointment Reminder</option>
                </select>
                <label>Email Type</label>
              </div>

              <div class="card-action">
                <button 
                  @click="sendTestEmail" 
                  class="btn waves-effect waves-light blue"
                  :disabled="loading || !testEmail"
                >
                  <i class="material-icons left">send</i>
                  {{ loading ? 'Sending...' : 'Send Test Email' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col s12 m6">
          <div class="card">
            <div class="card-content">
              <span class="card-title">
                <i class="material-icons left">settings</i>
                Email Configuration
              </span>
              
              <div class="collection">
                <div class="collection-item">
                  <span class="title">SendGrid Status</span>
                  <p class="grey-text">
                    <i class="material-icons left tiny">
                      {{ emailConfigured ? 'check_circle' : 'error' }}
                    </i>
                    {{ emailConfigured ? 'Configured' : 'Not Configured' }}
                  </p>
                </div>
                <div class="collection-item">
                  <span class="title">From Email</span>
                  <p class="grey-text">mindbridge@example.com</p>
                </div>
                <div class="collection-item">
                  <span class="title">Templates</span>
                  <p class="grey-text">Welcome, Appointment, Reminder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email History/Logs -->
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <span class="card-title">
                <i class="material-icons left">history</i>
                Recent Email Activity
              </span>
              
              <div v-if="emailLogs.length === 0" class="center-align grey-text">
                <i class="material-icons large">mail_outline</i>
                <p>No email activity yet</p>
              </div>

              <div v-else class="collection">
                <div 
                  v-for="log in emailLogs" 
                  :key="log.id"
                  class="collection-item"
                >
                  <div class="row valign-wrapper">
                    <div class="col s1">
                      <i class="material-icons" :class="log.success ? 'green-text' : 'red-text'">
                        {{ log.success ? 'check_circle' : 'error' }}
                      </i>
                    </div>
                    <div class="col s3">
                      <span class="title">{{ log.type }}</span>
                    </div>
                    <div class="col s4">
                      <span class="grey-text">{{ log.email }}</span>
                    </div>
                    <div class="col s3">
                      <span class="grey-text">{{ formatDate(log.timestamp) }}</span>
                    </div>
                    <div class="col s1">
                      <button 
                        @click="viewEmailDetails(log)" 
                        class="btn-small blue lighten-1"
                      >
                        <i class="material-icons">visibility</i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="row">
        <div class="col s12">
          <div class="card-panel" :class="messageType === 'success' ? 'green lighten-4' : 'red lighten-4'">
            <i class="material-icons left" :class="messageType === 'success' ? 'green-text' : 'red-text'">
              {{ messageType === 'success' ? 'check_circle' : 'error' }}
            </i>
            {{ message }}
          </div>
        </div>
      </div>
    </div>

    <!-- Email Details Modal -->
    <div id="email-details-modal" class="modal">
      <div class="modal-content">
        <h4>Email Details</h4>
        <div v-if="selectedEmailLog">
          <p><strong>Type:</strong> {{ selectedEmailLog.type }}</p>
          <p><strong>Recipient:</strong> {{ selectedEmailLog.email }}</p>
          <p><strong>Status:</strong> 
            <span :class="selectedEmailLog.success ? 'green-text' : 'red-text'">
              {{ selectedEmailLog.success ? 'Success' : 'Failed' }}
            </span>
          </p>
          <p><strong>Timestamp:</strong> {{ formatDate(selectedEmailLog.timestamp) }}</p>
          <p><strong>Message:</strong> {{ selectedEmailLog.message }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-close waves-effect waves-green btn-flat">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEmailService } from '@/composables/useEmailService'

const { sendWelcomeEmail, testEmailService, loading, error } = useEmailService()

// Form data
const testEmail = ref('test@example.com')
const emailType = ref('welcome')

// UI state
const message = ref('')
const messageType = ref('success')
const emailLogs = ref([])
const selectedEmailLog = ref(null)

// Computed
const emailConfigured = computed(() => {
  // Check if SendGrid is configured
  return true // For demo purposes
})

// Methods
const sendTestEmail = async () => {
  message.value = ''
  
  try {
    let result
    
    switch (emailType.value) {
      case 'welcome':
        result = await testEmailService(testEmail.value)
        break
      case 'appointment':
        // Mock appointment data for testing
        const mockAppointment = {
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 60,
          sessionType: 'video'
        }
        // This would need actual appointment confirmation logic
        result = { success: true, message: 'Appointment email test (mock)' }
        break
      case 'reminder':
        // Mock reminder data for testing
        result = { success: true, message: 'Reminder email test (mock)' }
        break
      default:
        throw new Error('Unknown email type')
    }

    if (result.success) {
      message.value = result.message
      messageType.value = 'success'
      
      // Add to logs
      emailLogs.value.unshift({
        id: Date.now(),
        type: emailType.value,
        email: testEmail.value,
        success: true,
        message: result.message,
        timestamp: new Date()
      })
    } else {
      throw new Error(result.message)
    }

  } catch (err) {
    message.value = 'Error sending email: ' + err.message
    messageType.value = 'error'
    
    // Add to logs
    emailLogs.value.unshift({
      id: Date.now(),
      type: emailType.value,
      email: testEmail.value,
      success: false,
      message: err.message,
      timestamp: new Date()
    })
  }

  // Clear message after 5 seconds
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const viewEmailDetails = (log) => {
  selectedEmailLog.value = log
  const modal = M.Modal.getInstance(document.getElementById('email-details-modal'))
  modal.open()
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      M.FormSelect.init(document.querySelectorAll('select'))
      M.Modal.init(document.querySelectorAll('.modal'))
    }, 100)
  }
})
</script>

<style scoped>
.email-management {
  padding: 2rem 0;
}

.card-title i {
  font-size: 1.5rem;
}

.collection-item .title {
  font-weight: 500;
}

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
}

.modal {
  max-height: 80%;
}
</style>
