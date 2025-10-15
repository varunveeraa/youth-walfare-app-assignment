<template>
  <div class="book-appointment">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>Book a Session</h4>
          <p class="grey-text">Connect with a licensed mental health professional who understands your needs.</p>

          <!-- Pre-selected counsellor notification -->
          <div v-if="route.query.counsellor" class="card-panel teal lighten-5 teal-text">
            <i class="material-icons left">info</i>
            <span v-if="selectedCounsellor">
              Ready to book with <strong>{{ selectedCounsellor.displayName }}</strong>?
              Click "Book Session" below or browse other counsellors.
            </span>
            <span v-else>
              Loading your selected counsellor...
            </span>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="row">
        <div class="col s12 m6">
          <div class="input-field">
            <i class="material-icons prefix">search</i>
            <input
              id="search"
              type="text"
              v-model="searchQuery"
              @input="handleSearch"
            >
            <label for="search">Search counsellors...</label>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="input-field">
            <select v-model="selectedSpecialization" @change="handleFilterChange">
              <option value="">All Specializations</option>
              <option value="anxiety">Anxiety Disorders</option>
              <option value="depression">Depression</option>
              <option value="trauma">Trauma & PTSD</option>
              <option value="relationships">Relationships</option>
              <option value="addiction">Addiction</option>
              <option value="eating">Eating Disorders</option>
            </select>
            <label>Specialization</label>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="input-field">
            <select v-model="sessionType" @change="handleFilterChange">
              <option value="">All Session Types</option>
              <option value="video">Video Call</option>
              <option value="audio">Audio Call</option>
              <option value="chat">Text Chat</option>
            </select>
            <label>Session Type</label>
          </div>
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
        <p>Loading counsellors...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
        <i class="material-icons left">error</i>
        {{ error }}
      </div>

      <!-- Counsellors List -->
      <div class="row">
        <div class="col s12">
          <h5>Available Counsellors</h5>

          <div v-if="filteredCounsellors.length === 0 && !loading" class="center-align">
            <i class="material-icons large grey-text">person_search</i>
            <p class="grey-text">No counsellors found matching your criteria.</p>
          </div>

          <div
            v-for="counsellor in filteredCounsellors"
            :key="counsellor.id"
            class="card counsellor-card"
            :class="{
              'teal lighten-5': route.query.counsellor === counsellor.id,
              'pulse': route.query.counsellor === counsellor.id
            }"
          >
            <div class="card-content">
              <div class="row">
                <div class="col s12 m3 center-align">
                  <img
                    :src="counsellor.profilePicture || '/api/placeholder/150/150'"
                    :alt="counsellor.displayName"
                    class="circle responsive-img counsellor-avatar"
                  >
                  <div class="rating-display">
                    <div class="stars">
                      <i
                        v-for="star in 5"
                        :key="star"
                        class="material-icons"
                        :class="star <= counsellor.averageRating ? 'amber-text' : 'grey-text text-lighten-2'"
                      >
                        star
                      </i>
                    </div>
                    <span class="grey-text">{{ counsellor.averageRating.toFixed(1) }} ({{ counsellor.totalRatings }} reviews)</span>
                  </div>
                </div>

                <div class="col s12 m6">
                  <h5>{{ counsellor.displayName }}</h5>
                  <p class="grey-text">{{ counsellor.experience }} years experience</p>
                  <p>{{ counsellor.bio }}</p>

                  <div class="specializations">
                    <span
                      v-for="spec in counsellor.specializations"
                      :key="spec"
                      class="chip"
                    >
                      {{ spec }}
                    </span>
                  </div>

                  <div class="session-types">
                    <span class="grey-text">Available via: </span>
                    <span
                      v-for="type in counsellor.sessionTypes"
                      :key="type"
                      class="chip blue lighten-4"
                    >
                      <i class="material-icons left tiny">
                        {{ getSessionIcon(type) }}
                      </i>
                      {{ type }}
                    </span>
                  </div>
                </div>

                <div class="col s12 m3 center-align">
                  <div class="pricing">
                    <h6 class="teal-text">${{ counsellor.hourlyRate }}/hour</h6>
                  </div>

                  <div class="availability-status">
                    <span
                      class="chip"
                      :class="counsellor.isAvailable ? 'green lighten-4' : 'red lighten-4'"
                    >
                      <i class="material-icons left tiny">
                        {{ counsellor.isAvailable ? 'check_circle' : 'schedule' }}
                      </i>
                      {{ counsellor.isAvailable ? 'Available' : 'Busy' }}
                    </span>
                  </div>

                  <button
                    @click="selectCounsellor(counsellor)"
                    class="btn waves-effect waves-light teal"
                    :disabled="!counsellor.isAvailable"
                  >
                    <i class="material-icons left">event</i>
                    Book Session
                  </button>

                  <button
                    @click="viewProfile(counsellor)"
                    class="btn-flat waves-effect waves-teal"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div id="booking-modal" class="modal">
      <div class="modal-content" v-if="selectedCounsellor">
        <h4>Book Session with {{ selectedCounsellor.displayName }}</h4>

        <form @submit.prevent="submitBooking">
          <div class="row">
            <div class="col s12 m6">
              <div class="input-field">
                <input
                  id="appointment-date"
                  type="date"
                  v-model="booking.date"
                  :min="minDate"
                  :class="{ invalid: errors.date }"
                  required
                >
                <label for="appointment-date" class="active">Preferred Date</label>
                <span v-if="errors.date" class="helper-text error-text">
                  {{ errors.date }}
                </span>
              </div>
            </div>

            <div class="col s12 m6">
              <div class="input-field">
                <select v-model="booking.time" required>
                  <option value="" disabled>Choose time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
                <label>Preferred Time</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col s12 m6">
              <div class="input-field">
                <select v-model="booking.sessionType" required>
                  <option value="" disabled>Choose session type</option>
                  <option
                    v-for="type in selectedCounsellor.sessionTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ type }} call
                  </option>
                </select>
                <label>Session Type</label>
              </div>
            </div>

            <div class="col s12 m6">
              <div class="input-field">
                <select v-model="booking.duration" required>
                  <option value="" disabled>Choose duration</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
                <label>Duration</label>
              </div>
            </div>
          </div>

          <div class="input-field">
            <textarea
              id="booking-notes"
              class="materialize-textarea"
              v-model="booking.notes"
            ></textarea>
            <label for="booking-notes">Additional notes (optional)</label>
          </div>

          <div class="booking-summary card-panel grey lighten-5">
            <h6>Booking Summary</h6>
            <p><strong>Counsellor:</strong> {{ selectedCounsellor.displayName }}</p>
            <p><strong>Date:</strong> {{ formatBookingDate(booking.date) }}</p>
            <p><strong>Time:</strong> {{ booking.time }}</p>
            <p><strong>Duration:</strong> {{ booking.duration }} minutes</p>
            <p><strong>Session Type:</strong> {{ booking.sessionType }}</p>
            <p><strong>Cost:</strong> ${{ calculateCost() }}</p>
          </div>

          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Cancel</a>
            <button
              type="submit"
              class="waves-effect waves-light btn teal"
              :disabled="submitting"
            >
              <span v-if="submitting">
                <i class="material-icons left">hourglass_empty</i>
                Booking...
              </span>
              <span v-else>
                <i class="material-icons left">event</i>
                Confirm Booking
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Counsellor Profile Modal -->
    <div id="profile-modal" class="modal modal-fixed-footer">
      <div class="modal-content" v-if="selectedCounsellor">
        <div class="row">
          <div class="col s12 m4 center-align">
            <img
              :src="selectedCounsellor.profilePicture || '/api/placeholder/200/200'"
              :alt="selectedCounsellor.displayName"
              class="circle responsive-img"
              style="max-width: 200px;"
            >
            <div class="rating-display">
              <div class="stars">
                <i
                  v-for="star in 5"
                  :key="star"
                  class="material-icons"
                  :class="star <= selectedCounsellor.averageRating ? 'amber-text' : 'grey-text text-lighten-2'"
                >
                  star
                </i>
              </div>
              <span class="grey-text">{{ selectedCounsellor.averageRating.toFixed(1) }} ({{ selectedCounsellor.totalRatings }} reviews)</span>
            </div>
          </div>

          <div class="col s12 m8">
            <h4>{{ selectedCounsellor.displayName }}</h4>
            <p class="grey-text">{{ selectedCounsellor.experience }} years experience</p>

            <h6>About</h6>
            <p>{{ selectedCounsellor.bio }}</p>

            <h6>Specializations</h6>
            <div class="specializations">
              <span
                v-for="spec in selectedCounsellor.specializations"
                :key="spec"
                class="chip"
              >
                {{ spec }}
              </span>
            </div>

            <h6>Qualifications</h6>
            <ul>
              <li v-for="qual in selectedCounsellor.qualifications" :key="qual">
                {{ qual }}
              </li>
            </ul>

            <h6>Session Types</h6>
            <div class="session-types">
              <span
                v-for="type in selectedCounsellor.sessionTypes"
                :key="type"
                class="chip blue lighten-4"
              >
                <i class="material-icons left tiny">
                  {{ getSessionIcon(type) }}
                </i>
                {{ type }}
              </span>
            </div>

            <h6>Languages</h6>
            <p>{{ selectedCounsellor.languages.join(', ') }}</p>

            <h6>Rate</h6>
            <p class="teal-text text-darken-2">${{ selectedCounsellor.hourlyRate }}/hour</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Close</a>
        <button
          @click="selectCounsellorFromProfile"
          class="waves-effect waves-light btn teal"
          :disabled="!selectedCounsellor?.isAvailable"
        >
          <i class="material-icons left">event</i>
          Book Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCounsellorProfiles, useAppointments } from '@/composables/useFirestore'
import { validateRequired } from '@/utils/validation'
import { where, orderBy } from 'firebase/firestore'

const route = useRoute()
const { user } = useAuth()
const { getAllProfiles, loading, error } = useCounsellorProfiles()
const { createAppointment } = useAppointments()

// Reactive data
const counsellors = ref([])
const searchQuery = ref('')
const selectedSpecialization = ref('')
const sessionType = ref('')
const selectedCounsellor = ref(null)
const submitting = ref(false)

const booking = reactive({
  date: '',
  time: '',
  sessionType: '',
  duration: '60',
  notes: ''
})

const errors = reactive({
  date: null
})

// Computed properties
const filteredCounsellors = computed(() => {
  let filtered = counsellors.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(counsellor =>
      counsellor.displayName.toLowerCase().includes(query) ||
      counsellor.bio.toLowerCase().includes(query) ||
      counsellor.specializations.some(spec => spec.toLowerCase().includes(query))
    )
  }

  if (selectedSpecialization.value) {
    filtered = filtered.filter(counsellor =>
      counsellor.specializations.includes(selectedSpecialization.value)
    )
  }

  if (sessionType.value) {
    filtered = filtered.filter(counsellor =>
      counsellor.sessionTypes.includes(sessionType.value)
    )
  }

  return filtered
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Methods
const loadCounsellors = async () => {
  try {
    console.log('Loading counsellors...')

    // For now, only require isActive (remove verification requirement for testing)
    const constraints = [
      where('isActive', '==', true)
      // Temporarily remove orderBy to avoid index issues
      // orderBy('averageRating', 'desc')
    ]

    const fetchedCounsellors = await getAllProfiles(constraints)
    console.log('Fetched counsellors:', fetchedCounsellors)

    // Add mock availability status
    counsellors.value = fetchedCounsellors.map(counsellor => ({
      ...counsellor,
      isAvailable: Math.random() > 0.3 // 70% chance of being available
    }))

    console.log('Final counsellors list:', counsellors.value)
  } catch (err) {
    console.error('Error loading counsellors:', err)
    console.error('Error details:', err.message)
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleFilterChange = () => {
  // Filter is handled by computed property
}

const selectCounsellor = (counsellor) => {
  selectedCounsellor.value = counsellor

  // Reset booking form
  booking.date = ''
  booking.time = ''
  booking.sessionType = counsellor.sessionTypes[0] || ''
  booking.duration = '60'
  booking.notes = ''
  errors.date = null

  // Open booking modal
  const modal = M.Modal.getInstance(document.getElementById('booking-modal'))
  modal.open()

  // Reinitialize selects
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('#booking-modal select'))
  }, 100)
}

const viewProfile = (counsellor) => {
  selectedCounsellor.value = counsellor

  // Open profile modal
  const modal = M.Modal.getInstance(document.getElementById('profile-modal'))
  modal.open()
}

const selectCounsellorFromProfile = () => {
  // Close profile modal
  const profileModal = M.Modal.getInstance(document.getElementById('profile-modal'))
  profileModal.close()

  // Open booking modal
  setTimeout(() => {
    selectCounsellor(selectedCounsellor.value)
  }, 300)
}

const validateBooking = () => {
  errors.date = validateRequired(booking.date, 'Date')

  return !errors.date
}

const submitBooking = async () => {
  if (!validateBooking()) {
    return
  }

  try {
    submitting.value = true

    const appointmentData = {
      userId: user.value.uid,
      counsellorId: selectedCounsellor.value.userId,
      counsellorName: selectedCounsellor.value.displayName,
      userName: user.value.displayName,
      appointmentDate: new Date(`${booking.date}T${booking.time}`),
      duration: parseInt(booking.duration),
      sessionType: booking.sessionType,
      status: 'scheduled',
      userNotes: booking.notes,
      cost: calculateCost(),
      paymentStatus: 'pending',
      reminderSent: false
    }

    await createAppointment(appointmentData)

    // Close modal
    const modal = M.Modal.getInstance(document.getElementById('booking-modal'))
    modal.close()

    M.toast({ html: 'Appointment booked successfully!', classes: 'teal' })

    // Redirect to appointments page
    setTimeout(() => {
      window.location.href = '/my-appointments'
    }, 2000)
  } catch (err) {
    console.error('Error booking appointment:', err)
    M.toast({ html: 'Error booking appointment. Please try again.', classes: 'red' })
  } finally {
    submitting.value = false
  }
}

const calculateCost = () => {
  if (!selectedCounsellor.value || !booking.duration) return 0
  const hourlyRate = selectedCounsellor.value.hourlyRate
  const hours = parseInt(booking.duration) / 60
  return Math.round(hourlyRate * hours)
}

const formatBookingDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getSessionIcon = (type) => {
  switch (type) {
    case 'video': return 'videocam'
    case 'audio': return 'phone'
    case 'chat': return 'chat'
    default: return 'help'
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'))
  M.Modal.init(document.querySelectorAll('.modal'))

  // Load counsellors
  await loadCounsellors()

  // Add mock data if no counsellors exist
  if (counsellors.value.length === 0) {
    counsellors.value = getMockCounsellors()
  }

  // Check if a specific counsellor was requested via URL parameter
  const counsellorId = route.query.counsellor
  if (counsellorId) {
    // Find and pre-select the counsellor
    const preSelectedCounsellor = counsellors.value.find(c => c.id === counsellorId)
    if (preSelectedCounsellor) {
      console.log('Pre-selecting counsellor from URL:', preSelectedCounsellor.displayName)
      // Auto-open booking modal for the selected counsellor
      setTimeout(() => {
        selectCounsellor(preSelectedCounsellor)
      }, 500) // Small delay to ensure everything is loaded
    } else {
      console.warn('Counsellor not found with ID:', counsellorId)
    }
  }
})

// Mock data for demonstration
const getMockCounsellors = () => [
  {
    id: '1',
    userId: 'counsellor1',
    displayName: 'Dr. Sarah Johnson',
    bio: 'Specialized in anxiety and depression treatment for young adults. I believe in creating a safe, non-judgmental space for healing.',
    specializations: ['anxiety', 'depression', 'trauma'],
    qualifications: ['PhD in Clinical Psychology', 'Licensed Clinical Social Worker', '10+ years experience'],
    experience: 10,
    licenseNumber: 'PSY12345',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    profilePicture: 'https://via.placeholder.com/200x200?text=Dr.+Sarah',
    averageRating: 4.8,
    totalRatings: 127,
    hourlyRate: 120,
    sessionTypes: ['video', 'audio'],
    languages: ['English', 'Spanish']
  },
  {
    id: '2',
    userId: 'counsellor2',
    displayName: 'Dr. Michael Chen',
    bio: 'Helping young people navigate relationship challenges and build healthy communication skills.',
    specializations: ['relationships', 'communication', 'family therapy'],
    qualifications: ['MA in Marriage and Family Therapy', 'Licensed Marriage and Family Therapist'],
    experience: 8,
    licenseNumber: 'MFT67890',
    isVerified: true,
    isActive: true,
    isAvailable: true,
    profilePicture: 'https://via.placeholder.com/200x200?text=Dr.+Michael',
    averageRating: 4.6,
    totalRatings: 89,
    hourlyRate: 100,
    sessionTypes: ['video', 'audio', 'chat'],
    languages: ['English', 'Mandarin']
  },
  {
    id: '3',
    userId: 'counsellor3',
    displayName: 'Dr. Emily Rodriguez',
    bio: 'Specializing in trauma recovery and PTSD treatment using evidence-based approaches.',
    specializations: ['trauma', 'PTSD', 'anxiety'],
    qualifications: ['PsyD in Clinical Psychology', 'Trauma-Informed Care Specialist'],
    experience: 12,
    licenseNumber: 'PSY54321',
    isVerified: true,
    isActive: true,
    isAvailable: false,
    profilePicture: 'https://via.placeholder.com/200x200?text=Dr.+Emily',
    averageRating: 4.9,
    totalRatings: 156,
    hourlyRate: 140,
    sessionTypes: ['video'],
    languages: ['English', 'Spanish']
  }
]
</script>

<style scoped>
.book-appointment {
  padding: 2rem 0;
}

.counsellor-card {
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.counsellor-card:hover {
  transform: translateY(-2px);
}

.counsellor-avatar {
  max-width: 150px;
  margin-bottom: 1rem;
}

.rating-display {
  margin-top: 0.5rem;
}

.stars {
  margin-bottom: 0.25rem;
}

.stars .material-icons {
  font-size: 1.2rem;
}

.specializations, .session-types {
  margin: 1rem 0;
}

.chip {
  margin: 0.25rem;
  font-size: 0.8rem;
  height: 24px;
  line-height: 24px;
}

.pricing h6 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.availability-status {
  margin: 1rem 0;
}

.booking-summary {
  margin: 1rem 0;
}

.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
}

.modal {
  max-height: 90%;
}

.modal-content {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
}

@media only screen and (max-width: 600px) {
  .counsellor-card .row .col {
    text-align: center;
  }

  .counsellor-card .col.m3,
  .counsellor-card .col.m6 {
    margin-bottom: 1rem;
  }
}
</style>
