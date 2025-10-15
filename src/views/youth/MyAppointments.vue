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
            <router-link to="/book-appointment" class="btn waves-effect waves-light teal">
              <i class="material-icons left">add</i>
              Book Your First Session
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
                  <img
                    :src="appointment.counsellorProfilePicture || '/api/placeholder/100/100'"
                    :alt="appointment.counsellorName"
                    class="circle responsive-img counsellor-avatar"
                  >
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
    appointments.value = fetchedAppointments
  } catch (err) {
    console.error('Error loading appointments:', err)
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
      console.error('Error cancelling appointment:', err)
      M.toast({ html: 'Error cancelling appointment', classes: 'red' })
    }
  }
}

const bookAgain = (appointment) => {
  // Navigate to booking page with pre-filled counsellor
  router.push({
    path: '/book-appointment',
    query: { counsellorId: appointment.counsellorId }
  })
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize tabs
  M.Tabs.init(document.querySelectorAll('.tabs'))

  // Load appointments
  await loadAppointments()

  // Add mock data if no appointments exist
  if (appointments.value.length === 0) {
    appointments.value = getMockAppointments()
  }
})

// Mock data for demonstration
const getMockAppointments = () => [
  {
    id: '1',
    counsellorId: 'counsellor1',
    counsellorName: 'Dr. Sarah Johnson',
    counsellorProfilePicture: 'https://via.placeholder.com/100x100?text=Dr.+Sarah',
    userId: user.value.uid,
    appointmentDate: new Date('2024-01-20T14:00:00'),
    duration: 60,
    sessionType: 'video',
    status: 'scheduled',
    cost: 120,
    userNotes: 'Looking forward to discussing anxiety management strategies'
  },
  {
    id: '2',
    counsellorId: 'counsellor2',
    counsellorName: 'Dr. Michael Chen',
    counsellorProfilePicture: 'https://via.placeholder.com/100x100?text=Dr.+Michael',
    userId: user.value.uid,
    appointmentDate: new Date('2024-01-15T16:00:00'),
    duration: 45,
    sessionType: 'video',
    status: 'completed',
    cost: 75,
    userNotes: 'Follow-up session'
  },
  {
    id: '3',
    counsellorId: 'counsellor3',
    counsellorName: 'Dr. Emily Rodriguez',
    counsellorProfilePicture: 'https://via.placeholder.com/100x100?text=Dr.+Emily',
    userId: user.value.uid,
    appointmentDate: new Date('2024-01-10T10:00:00'),
    duration: 60,
    sessionType: 'audio',
    status: 'cancelled',
    cost: 140,
    userNotes: 'Initial consultation'
  }
]
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
