<template>
  <div class="my-appointments">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>My Appointments</h4>
          <p class="grey-text">View and manage your scheduled sessions with counsellors.</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="row">
        <div class="col s12">
          <ul class="tabs">
            <li class="tab col s3">
              <a
                href="#all"
                :class="{ active: activeTab === 'all' }"
                @click="setActiveTab('all')"
              >
                All
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#upcoming"
                :class="{ active: activeTab === 'upcoming' }"
                @click="setActiveTab('upcoming')"
              >
                Upcoming
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#completed"
                :class="{ active: activeTab === 'completed' }"
                @click="setActiveTab('completed')"
              >
                Completed
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#cancelled"
                :class="{ active: activeTab === 'cancelled' }"
                @click="setActiveTab('cancelled')"
              >
                Cancelled
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="center-align">
        <div class="preloader-wrapper active">
          <div class="spinner-layer spinner-teal-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle"></div>
            </div>
            <div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
        <p>Loading appointments...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
        <i class="material-icons left">error</i>
        {{ error }}
      </div>

      <!-- Appointments List -->
      <div class="row">
        <div class="col s12">
          <div v-if="filteredAppointments.length === 0 && !loading" class="center-align">
            <i class="material-icons large grey-text">event_busy</i>
            <p class="grey-text">No {{ activeTab === 'all' ? '' : activeTab }} appointments found.</p>
            <router-link to="/counsellors" class="btn waves-effect waves-light teal">
              <i class="material-icons left">add</i>
              Find Your Counsellor
            </router-link>
          </div>

          <div
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
            class="card appointment-card"
          >
            <div class="card-content">
              <div class="row">
                <div class="col s12 m3 center-align">
                  <div v-if="appointment.counsellorProfilePicture" class="profile-image-container">
                    <img
                      :src="appointment.counsellorProfilePicture"
                      :alt="appointment.counsellorName"
                      class="circle responsive-img counsellor-avatar"
                      @error="handleImageError"
                    >
                  </div>
                  <div v-else class="profile-placeholder circle counsellor-avatar">
                    <div class="avatar-initials">
                      {{ getInitials(appointment.counsellorName) }}
                    </div>
                  </div>
                  <h6>{{ appointment.counsellorName }}</h6>
                </div>

                <div class="col s12 m6">
                  <div class="appointment-details">
                    <h6>{{ formatDate(appointment.appointmentDate) }}</h6>
                    <p><strong>Time:</strong> {{ formatTime(appointment.appointmentDate) }}</p>
                    <p><strong>Duration:</strong> {{ appointment.duration }} minutes</p>
                    <p><strong>Session Type:</strong> {{ appointment.sessionType }}</p>
                    <p><strong>Cost:</strong> ${{ appointment.cost }}</p>
                    <p v-if="appointment.userNotes"><strong>Notes:</strong> {{ appointment.userNotes }}</p>
                  </div>
                </div>

                <div class="col s12 m3 center-align">
                  <div class="appointment-status">
                    <span
                      class="chip"
                      :class="getStatusClass(appointment.status)"
                    >
                      <i class="material-icons left tiny">
                        {{ getStatusIcon(appointment.status) }}
                      </i>
                      {{ appointment.status }}
                    </span>
                  </div>

                  <div class="appointment-actions">
                    <!-- Upcoming appointment actions -->
                    <template v-if="appointment.status === 'scheduled'">
                      <button
                        @click="joinSession(appointment)"
                        class="btn waves-effect waves-light teal"
                        :disabled="!canJoinSession(appointment)"
                      >
                        <i class="material-icons left">videocam</i>
                        {{ canJoinSession(appointment) ? 'Join' : 'Not Ready' }}
                      </button>

                      <button
                        @click="rescheduleAppointment(appointment)"
                        class="btn-flat waves-effect waves-teal"
                      >
                        Reschedule
                      </button>

                      <button
                        @click="cancelAppointment(appointment)"
                        class="btn-flat waves-effect waves-red red-text"
                      >
                        Cancel
                      </button>
                    </template>

                    <!-- Completed appointment actions -->
                    <template v-if="appointment.status === 'completed'">
                      <router-link
                        :to="`/rate-counsellor/${appointment.id}`"
                        class="btn waves-effect waves-light amber"
                      >
                        <i class="material-icons left">star</i>
                        Rate Session
                      </router-link>

                      <button
                        @click="bookAgain(appointment)"
                        class="btn-flat waves-effect waves-teal"
                      >
                        Book Again
                      </button>
                    </template>

                    <!-- Cancelled appointment actions -->
                    <template v-if="appointment.status === 'cancelled'">
                      <button
                        @click="bookAgain(appointment)"
                        class="btn waves-effect waves-light teal"
                      >
                        <i class="material-icons left">refresh</i>
                        Book Again
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAppointments } from '@/composables/useFirestore'
import { where, orderBy } from 'firebase/firestore'

const router = useRouter()
const { user } = useAuth()
const { getAllAppointments, updateAppointment, loading, error } = useAppointments()

// Reactive data
const appointments = ref([])
const activeTab = ref('all')

// Computed properties
const filteredAppointments = computed(() => {
  let filtered = appointments.value

  switch (activeTab.value) {
    case 'upcoming':
      filtered = filtered.filter(apt => apt.status === 'scheduled')
      break
    case 'completed':
      filtered = filtered.filter(apt => apt.status === 'completed')
      break
    case 'cancelled':
      filtered = filtered.filter(apt => apt.status === 'cancelled')
      break
    default: // all
      break
  }

  return filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
})

// Methods
const loadAppointments = async () => {
  try {
    const constraints = [
      where('userId', '==', user.value.uid),
      orderBy('appointmentDate', 'desc')
    ]

    const fetchedAppointments = await getAllAppointments(constraints)

    // Convert Firebase Timestamps to JavaScript Dates
    appointments.value = fetchedAppointments.map(appointment => ({
      ...appointment,
      appointmentDate: appointment.appointmentDate?.toDate ?
        appointment.appointmentDate.toDate() :
        new Date(appointment.appointmentDate),
      createdAt: appointment.createdAt?.toDate ?
        appointment.createdAt.toDate() :
        new Date(appointment.createdAt),
      updatedAt: appointment.updatedAt?.toDate ?
        appointment.updatedAt.toDate() :
        new Date(appointment.updatedAt)
    }))
  } catch (err) {
    error.value = err.message
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const formatDate = (date) => {
  if (!date) return 'Invalid Date'

  try {
    // Handle Firebase Timestamp objects
    const jsDate = date?.toDate ? date.toDate() : new Date(date)

    if (isNaN(jsDate.getTime())) {
      return 'Invalid Date'
    }

    return jsDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (err) {
    return 'Invalid Date'
  }
}

const formatTime = (date) => {
  if (!date) return 'Invalid Date'

  try {
    // Handle Firebase Timestamp objects
    const jsDate = date?.toDate ? date.toDate() : new Date(date)

    if (isNaN(jsDate.getTime())) {
      return 'Invalid Date'
    }

    return jsDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Invalid Date'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled': return 'blue lighten-4'
    case 'completed': return 'green lighten-4'
    case 'cancelled': return 'red lighten-4'
    default: return 'grey lighten-4'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'scheduled': return 'schedule'
    case 'completed': return 'check_circle'
    case 'cancelled': return 'cancel'
    default: return 'help'
  }
}

const canJoinSession = (appointment) => {
  const now = new Date()
  const appointmentTime = new Date(appointment.appointmentDate)
  const timeDiff = appointmentTime.getTime() - now.getTime()
  const minutesDiff = timeDiff / (1000 * 60)

  // Can join 15 minutes before to 30 minutes after
  return minutesDiff <= 15 && minutesDiff >= -30
}

const joinSession = (appointment) => {
  // In a real app, this would open the video call interface
  M.toast({ html: 'Joining session...', classes: 'teal' })

  // Mock joining session
  setTimeout(() => {
    M.toast({ html: 'Session joined successfully!', classes: 'green' })
  }, 2000)
}

const rescheduleAppointment = (appointment) => {
  // In a real app, this would open a reschedule modal
  M.toast({ html: 'Reschedule feature coming soon!', classes: 'blue' })
}

const cancelAppointment = async (appointment) => {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    try {
      await updateAppointment(appointment.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'user'
      })

      // Reload appointments
      await loadAppointments()

      M.toast({ html: 'Appointment cancelled successfully', classes: 'orange' })
    } catch (err) {
      M.toast({ html: 'Error cancelling appointment', classes: 'red' })
    }
  }
}

const bookAgain = (appointment) => {
  // Navigate to counsellor directory to find and book with the same counsellor
  router.push({
    path: '/counsellors',
    query: { counsellorId: appointment.counsellorId }
  })
}

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Handle image loading errors
const handleImageError = (event) => {
  // Hide the broken image and show placeholder instead
  event.target.style.display = 'none'
  const container = event.target.closest('.profile-image-container')
  if (container) {
    container.style.display = 'none'
    const placeholder = container.nextElementSibling
    if (placeholder && placeholder.classList.contains('profile-placeholder')) {
      placeholder.style.display = 'flex'
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize tabs
  M.Tabs.init(document.querySelectorAll('.tabs'))

  // Load appointments
  await loadAppointments()
})


</script>

<style scoped>
.my-appointments {
  padding: 2rem 0;
}

.tabs .tab a {
  color: #26a69a;
}

.tabs .tab a.active {
  color: #26a69a;
  border-bottom: 2px solid #26a69a;
}

.appointment-card {
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
}

.counsellor-avatar {
  max-width: 100px;
  margin-bottom: 0.5rem;
}

.profile-image-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.profile-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #26a69a, #4db6ac);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
}

.profile-placeholder.circle {
  border-radius: 50%;
}

.avatar-initials {
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.appointment-details p {
  margin: 0.25rem 0;
}

.appointment-status {
  margin-bottom: 1rem;
}

.appointment-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chip {
  font-size: 0.8rem;
  height: 24px;
  line-height: 24px;
}

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
}

@media only screen and (max-width: 600px) {
  .appointment-card .row .col {
    text-align: center;
    margin-bottom: 1rem;
  }

  .appointment-actions {
    flex-direction: column;
    align-items: center;
  }

  .appointment-actions .btn,
  .appointment-actions .btn-flat {
    width: 100%;
    margin: 0.25rem 0;
  }
}
</style>
