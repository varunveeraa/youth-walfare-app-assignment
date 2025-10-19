<template>
  <div class="counsellor-appointments">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>My Appointments</h4>
          <p class="grey-text">View and manage your scheduled appointments with clients.</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row">
        <div class="col s12 m3">
          <div class="card-panel teal lighten-4 center-align">
            <i class="material-icons large teal-text">event</i>
            <h5 class="teal-text">{{ stats.total }}</h5>
            <p>Total Appointments</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel blue lighten-4 center-align">
            <i class="material-icons large blue-text">schedule</i>
            <h5 class="blue-text">{{ stats.upcoming }}</h5>
            <p>Upcoming</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel green lighten-4 center-align">
            <i class="material-icons large green-text">check_circle</i>
            <h5 class="green-text">{{ stats.completed }}</h5>
            <p>Completed</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel orange lighten-4 center-align">
            <i class="material-icons large orange-text">cancel</i>
            <h5 class="orange-text">{{ stats.cancelled }}</h5>
            <p>Cancelled</p>
          </div>
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
                All ({{ stats.total }})
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#upcoming"
                :class="{ active: activeTab === 'upcoming' }"
                @click="setActiveTab('upcoming')"
              >
                Upcoming ({{ stats.upcoming }})
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#completed"
                :class="{ active: activeTab === 'completed' }"
                @click="setActiveTab('completed')"
              >
                Completed ({{ stats.completed }})
              </a>
            </li>
            <li class="tab col s3">
              <a
                href="#cancelled"
                :class="{ active: activeTab === 'cancelled' }"
                @click="setActiveTab('cancelled')"
              >
                Cancelled ({{ stats.cancelled }})
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="center-align">
        <div class="preloader-wrapper big active">
          <div class="spinner-layer spinner-blue-only">
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
      <div v-if="error" class="card-panel red lighten-4 red-text">
        <i class="material-icons left">error</i>
        Error loading appointments: {{ error }}
      </div>

      <!-- Appointments List -->
      <div class="row">
        <div class="col s12">
          <div v-if="filteredAppointments.length === 0 && !loading" class="center-align">
            <i class="material-icons large grey-text">event_busy</i>
            <p class="grey-text">No {{ activeTab === 'all' ? '' : activeTab }} appointments found.</p>
            <p class="grey-text">Appointments will appear here when clients book sessions with you.</p>
          </div>

          <div v-else>
            <div
              v-for="appointment in filteredAppointments"
              :key="appointment.id"
              class="card appointment-card"
            >
              <div class="card-content">
                <div class="row">
                  <!-- Client Info -->
                  <div class="col s12 m3">
                    <div class="client-info">
                      <img
                        :src="appointment.userProfilePicture || '/api/placeholder/60/60'"
                        :alt="appointment.userName"
                        class="circle responsive-img client-avatar"
                      >
                      <div class="client-details">
                        <h6 class="client-name">{{ getClientName(appointment) }}</h6>
                        <p class="grey-text">{{ appointment.userEmail || 'No email provided' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Appointment Details -->
                  <div class="col s12 m6">
                    <div class="appointment-details">
                      <h6>
                        <i class="material-icons left tiny">event</i>
                        {{ formatDate(appointment.appointmentDate) }}
                      </h6>
                      <p>
                        <i class="material-icons left tiny">schedule</i>
                        {{ formatTime(appointment.appointmentDate) }}
                        ({{ appointment.duration || 60 }} minutes)
                      </p>
                      <p>
                        <i class="material-icons left tiny">videocam</i>
                        {{ formatSessionType(appointment.sessionType) }}
                      </p>
                      <p v-if="appointment.userNotes" class="notes">
                        <i class="material-icons left tiny">note</i>
                        {{ appointment.userNotes }}
                      </p>
                    </div>
                  </div>

                  <!-- Status & Actions -->
                  <div class="col s12 m3">
                    <div class="appointment-status">
                      <span
                        class="chip"
                        :class="getStatusClass(appointment.status)"
                      >
                        <i class="material-icons left tiny">{{ getStatusIcon(appointment.status) }}</i>
                        {{ formatStatus(appointment.status) }}
                      </span>

                      <div class="appointment-actions">
                        <!-- Upcoming appointment actions -->
                        <div v-if="appointment.status === 'scheduled'">
                          <button
                            v-if="canJoinSession(appointment)"
                            @click="joinSession(appointment)"
                            class="btn green waves-effect waves-light btn-small"
                          >
                            <i class="material-icons left">videocam</i>
                            Join Session
                          </button>
                          <button
                            @click="rescheduleAppointment(appointment)"
                            class="btn blue waves-effect waves-light btn-small"
                          >
                            <i class="material-icons left">schedule</i>
                            Reschedule
                          </button>
                          <button
                            @click="cancelAppointment(appointment)"
                            class="btn red waves-effect waves-light btn-small"
                          >
                            <i class="material-icons left">cancel</i>
                            Cancel
                          </button>
                        </div>

                        <!-- Completed appointment actions -->
                        <div v-if="appointment.status === 'completed'">
                          <button
                            @click="addNotes(appointment)"
                            class="btn blue waves-effect waves-light btn-small"
                          >
                            <i class="material-icons left">note_add</i>
                            Add Notes
                          </button>
                        </div>
                      </div>
                    </div>
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

const stats = computed(() => {
  const total = appointments.value.length
  const upcoming = appointments.value.filter(apt => apt.status === 'scheduled').length
  const completed = appointments.value.filter(apt => apt.status === 'completed').length
  const cancelled = appointments.value.filter(apt => apt.status === 'cancelled').length

  return { total, upcoming, completed, cancelled }
})

// Methods
const loadAppointments = async () => {
  try {
    const constraints = [
      where('counsellorId', '==', user.value.uid),
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

const getClientName = (appointment) => {
  if (!appointment.userName) return 'Anonymous Client'

  // Handle case where userName might be duplicated or have issues
  const name = appointment.userName.trim()
  return name || appointment.userEmail?.split('@')[0] || 'Client'
}

const formatDate = (date) => {
  if (!date) return 'No date'

  // Handle Firestore timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date)

  if (isNaN(dateObj.getTime())) return 'Invalid date'

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  if (!date) return 'No time'

  // Handle Firestore timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date)

  if (isNaN(dateObj.getTime())) return 'Invalid time'

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatSessionType = (type) => {
  const types = {
    video: 'Video Call',
    audio: 'Audio Call',
    chat: 'Text Chat',
    'in-person': 'In-Person'
  }
  return types[type] || type
}

const formatStatus = (status) => {
  const statuses = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show'
  }
  return statuses[status] || status
}

const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled': return 'blue lighten-4 blue-text'
    case 'completed': return 'green lighten-4 green-text'
    case 'cancelled': return 'red lighten-4 red-text'
    case 'no-show': return 'orange lighten-4 orange-text'
    default: return 'grey lighten-4 grey-text'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'scheduled': return 'schedule'
    case 'completed': return 'check_circle'
    case 'cancelled': return 'cancel'
    case 'no-show': return 'person_off'
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
  // This would integrate with video calling service
  M.toast({ html: 'Joining session...', classes: 'blue' })
  // For now, just show a placeholder
  alert(`Joining ${appointment.sessionType} session with ${appointment.userName}`)
}

const rescheduleAppointment = (appointment) => {
  // This would open a reschedule modal
  M.toast({ html: 'Reschedule functionality coming soon', classes: 'blue' })
}

const cancelAppointment = async (appointment) => {
  if (confirm(`Are you sure you want to cancel the appointment with ${appointment.userName}?`)) {
    try {
      await updateAppointment(appointment.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'counsellor'
      })

      // Reload appointments
      await loadAppointments()

      M.toast({ html: 'Appointment cancelled successfully', classes: 'orange' })
    } catch (err) {
      M.toast({ html: 'Error cancelling appointment', classes: 'red' })
    }
  }
}

const addNotes = (appointment) => {
  // This would open a notes modal
  M.toast({ html: 'Notes functionality coming soon', classes: 'blue' })
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
.counsellor-appointments {
  padding: 2rem 0;
}

.appointment-card {
  margin-bottom: 1rem;
  border-left: 4px solid #26a69a;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-avatar {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.client-details h6 {
  margin: 0;
  font-weight: 500;
}

.client-details p {
  margin: 0.2rem 0 0 0;
  font-size: 0.9rem;
}

.appointment-details h6 {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.appointment-details p {
  margin: 0.3rem 0;
  display: flex;
  align-items: center;
}

.appointment-details .material-icons {
  margin-right: 0.5rem;
}

.notes {
  font-style: italic;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.appointment-status {
  text-align: center;
}

.appointment-actions {
  margin-top: 1rem;
}

.appointment-actions .btn-small {
  margin: 0.2rem;
  display: block;
  width: 100%;
}

.stats-card {
  text-align: center;
  padding: 1.5rem;
}

.stats-card i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.stats-card h5 {
  margin: 0.5rem 0;
  font-weight: bold;
}

@media (max-width: 600px) {
  .client-info {
    flex-direction: column;
    text-align: center;
  }

  .appointment-actions .btn-small {
    margin: 0.1rem;
  }
}
</style>
