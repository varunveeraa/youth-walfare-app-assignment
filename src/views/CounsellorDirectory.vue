<template>
  <div class="counsellor-directory">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>Find Your Counsellor</h4>
          <p class="grey-text">
            Browse our directory of qualified mental health professionals. 
            Search by specialty and find the right support for your needs.
          </p>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="row">
        <div class="col s12 m4">
          <div class="input-field">
            <i class="material-icons prefix">search</i>
            <input 
              id="search" 
              type="text" 
              v-model="searchQuery"
              @input="handleSearch"
              :disabled="loading"
            >
            <label for="search">Search counsellors...</label>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="input-field">
            <select v-model="selectedSpecialty" @change="handleSpecialtyFilter" :disabled="loading">
              <option value="">All Specialties</option>
              <option v-for="specialty in specialties" :key="specialty" :value="specialty">
                {{ specialty }}
              </option>
            </select>
            <label>Filter by Specialty</label>
          </div>
        </div>

        <div class="col s12 m2">
          <div class="input-field">
            <select v-model="sortField" @change="handleSortChange" :disabled="loading">
              <option value="averageRating">Rating</option>
              <option value="name">Name</option>
              <option value="experience">Experience</option>
              <option value="totalRatings">Reviews</option>
            </select>
            <label>Sort by</label>
          </div>
        </div>

        <div class="col s12 m2">
          <button 
            @click="resetFilters" 
            class="btn waves-effect waves-light grey"
            :disabled="loading"
            style="margin-top: 1rem;"
          >
            <i class="material-icons left">clear</i>
            Reset
          </button>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel grey lighten-5">
            <div class="row valign-wrapper">
              <div class="col s12 m6">
                <span class="grey-text">
                  <i class="material-icons left">people</i>
                  Showing {{ paginatedCounsellors.length }} of {{ filteredCounsellors.length }} counsellors
                </span>
              </div>
              <div class="col s12 m6 right-align">
                <div class="export-controls" style="margin-bottom: 1rem;">
                  <button
                    @click="exportCSV"
                    class="btn waves-effect waves-light blue"
                    :disabled="loading || exporting"
                    style="margin-right: 0.5rem;"
                  >
                    <i class="material-icons left">file_download</i>
                    CSV
                  </button>
                  <button
                    @click="exportPDF"
                    class="btn waves-effect waves-light red"
                    :disabled="loading || exporting"
                    style="margin-right: 0.5rem;"
                  >
                    <i class="material-icons left">picture_as_pdf</i>
                    PDF
                  </button>
                  <button
                    @click="exportJSONData"
                    class="btn waves-effect waves-light green"
                    :disabled="loading || exporting"
                  >
                    <i class="material-icons left">code</i>
                    JSON
                  </button>
                </div>
                <div class="input-field inline">
                  <select v-model="pageSize" @change="handlePageSizeChange" :disabled="loading">
                    <option value="6">6 per page</option>
                    <option value="12">12 per page</option>
                    <option value="24">24 per page</option>
                  </select>
                  <label>Show</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row">
        <div class="col s12 center-align">
          <div class="preloader-wrapper big active">
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
      </div>

      <!-- Error State -->
      <div v-if="error" class="row">
        <div class="col s12">
          <div class="card-panel red lighten-4 red-text">
            <i class="material-icons left">error</i>
            Error loading counsellors: {{ error }}
          </div>
        </div>
      </div>

      <!-- Counsellors Grid -->
      <div v-if="!loading && !error">
        <!-- Real Counsellors Section -->
        <div v-if="organizedCounsellors.hasReal">
          <div class="row">
            <div class="col s12">
              <h5 class="section-header">
                <i class="material-icons left">verified_user</i>
                Our Counsellors
              </h5>
              <p class="grey-text">Licensed mental health professionals ready to help you.</p>
            </div>
          </div>
          <div class="row">
            <div
              v-for="counsellor in organizedCounsellors.real"
              :key="counsellor.id"
              class="col s12 m6 l4"
            >
              <div class="card counsellor-card hoverable">
                <div class="card-image">
                  <img
                    :src="counsellor.profileImage || '/api/placeholder/300/200'"
                    :alt="counsellor.displayName"
                    class="counsellor-image"
                  >
                  <span class="card-title">{{ counsellor.displayName }}</span>
                  <div class="availability-badge">
                    <span class="chip green lighten-4 green-text">
                      <i class="material-icons left tiny">schedule</i>
                      {{ counsellor.availability }}
                    </span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="rating-section">
                    <div class="stars">
                      <i
                        v-for="(star, index) in getRatingStars(counsellor.averageRating)"
                        :key="index"
                        class="material-icons yellow-text"
                      >
                        {{ star }}
                      </i>
                    </div>
                    <span class="rating-text">
                      {{ formatRating(counsellor.averageRating) }}
                      ({{ counsellor.totalRatings }} reviews)
                    </span>
                  </div>
                  <div class="experience">
                    <i class="material-icons left">work</i>
                    <span>{{ counsellor.experience }} years experience</span>
                  </div>
                  <p class="bio-preview">{{ counsellor.bio?.substring(0, 100) }}...</p>
                  <div class="price-info">
                    <span class="price">${{ counsellor.hourlyRate }}/hour</span>
                    <span class="response-time">{{ counsellor.responseTime }}</span>
                  </div>
                </div>
                <div class="card-action">
                  <button
                    @click="viewProfile(counsellor)"
                    class="btn-flat teal-text"
                  >
                    View Profile
                  </button>
                  <button
                    @click="bookAppointment(counsellor)"
                    class="btn teal"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Demo Counsellors Section -->
        <div v-if="organizedCounsellors.hasDemo">
          <div class="row">
            <div class="col s12">
              <h5 class="section-header demo-section">
                <i class="material-icons left">info</i>
                Demo Profiles
              </h5>
              <p class="grey-text">Sample counsellor profiles for demonstration purposes.</p>
            </div>
          </div>
          <div class="row">
            <div
              v-for="counsellor in organizedCounsellors.demo"
              :key="counsellor.id"
              class="col s12 m6 l4"
            >
              <div class="card counsellor-card hoverable">
                <div class="demo-badge">
                  <span class="chip blue lighten-4 blue-text text-darken-2">
                    <i class="material-icons left tiny">info</i>
                    Demo Profile
                  </span>
                </div>
                <div class="card-image">
                  <img
                    :src="counsellor.profileImage || '/api/placeholder/300/200'"
                    :alt="counsellor.displayName"
                    class="counsellor-image"
                  >
                  <span class="card-title">{{ counsellor.displayName }}</span>
                  <div class="availability-badge">
                    <span class="chip green lighten-4 green-text">
                      <i class="material-icons left tiny">schedule</i>
                      {{ counsellor.availability }}
                    </span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="rating-section">
                    <div class="stars">
                      <i
                        v-for="(star, index) in getRatingStars(counsellor.averageRating)"
                        :key="index"
                        class="material-icons yellow-text"
                      >
                        {{ star }}
                      </i>
                    </div>
                    <span class="rating-text">
                      {{ formatRating(counsellor.averageRating) }}
                      ({{ counsellor.totalRatings }} reviews)
                    </span>
                  </div>
                  <div class="experience">
                    <i class="material-icons left">work</i>
                    <span>{{ counsellor.experience }} years experience</span>
                  </div>
                  <p class="bio-preview">{{ counsellor.bio?.substring(0, 100) }}...</p>
                  <div class="price-info">
                    <span class="price">${{ counsellor.hourlyRate }}/hour</span>
                    <span class="response-time">{{ counsellor.responseTime }}</span>
                  </div>
                </div>
                <div class="card-action">
                  <button
                    @click="viewProfile(counsellor)"
                    class="btn-flat teal-text"
                  >
                    View Profile
                  </button>
                  <button
                    class="btn disabled grey"
                    title="Demo profiles cannot be booked"
                  >
                    Demo Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!organizedCounsellors.hasReal && !organizedCounsellors.hasDemo" class="row">
          <div class="col s12">
            <div class="card-panel center-align grey lighten-5">
              <i class="material-icons large grey-text">search_off</i>
              <h5 class="grey-text">No counsellors found</h5>
              <p class="grey-text">
                Try adjusting your search criteria or browse all counsellors.
              </p>
              <button @click="resetFilters" class="btn waves-effect waves-light teal">
                <i class="material-icons left">refresh</i>
                Show All Counsellors
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="row">
        <div class="col s12">
          <div class="pagination-wrapper center-align">
            <ul class="pagination">
              <li :class="{ disabled: currentPage === 1 }">
                <a @click="goToPage(currentPage - 1)">
                  <i class="material-icons">chevron_left</i>
                </a>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page"
                :class="{ active: page === currentPage }"
              >
                <a @click="goToPage(page)">{{ page }}</a>
              </li>
              
              <li :class="{ disabled: currentPage === totalPages }">
                <a @click="goToPage(currentPage + 1)">
                  <i class="material-icons">chevron_right</i>
                </a>
              </li>
            </ul>
            
            <p class="grey-text">
              Page {{ currentPage }} of {{ totalPages }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Counsellor Profile Modal -->
    <div id="counsellor-profile-modal" class="modal modal-fixed-footer">
      <div class="modal-content">
        <div v-if="selectedCounsellor">
          <div class="modal-header">
            <h4>{{ selectedCounsellor.displayName }}</h4>
            <div v-if="selectedCounsellor.isDummy" class="demo-badge-modal">
              <span class="chip blue lighten-4 blue-text text-darken-2">
                <i class="material-icons left tiny">info</i>
                Demo Profile - For demonstration purposes
              </span>
            </div>
          </div>

          <div class="row">
            <div class="col s12 m4">
              <img 
                :src="selectedCounsellor.profileImage || '/api/placeholder/200/200'" 
                :alt="selectedCounsellor.displayName"
                class="responsive-img circle"
              >
            </div>
            <div class="col s12 m8">
              <div class="rating-section">
                <div class="stars">
                  <i 
                    v-for="(star, index) in getRatingStars(selectedCounsellor.averageRating)" 
                    :key="index"
                    class="material-icons yellow-text"
                  >
                    {{ star }}
                  </i>
                </div>
                <span class="rating-text">
                  {{ formatRating(selectedCounsellor.averageRating) }}
                  ({{ selectedCounsellor.totalRatings }} reviews)
                </span>
              </div>
              
              <p><strong>Experience:</strong> {{ selectedCounsellor.experience || 'New' }} years</p>
              <p><strong>Qualifications:</strong> {{ selectedCounsellor.qualifications || 'Licensed Professional' }}</p>
              <p><strong>Languages:</strong> {{ selectedCounsellor.languages?.join(', ') || 'English' }}</p>
            </div>
          </div>

          <h5>About</h5>
          <p>{{ selectedCounsellor.bio }}</p>

          <h5>Specialties</h5>
          <div class="specialties">
            <span
              v-for="specialty in selectedCounsellor.specializations"
              :key="specialty"
              class="chip"
              :class="`${getSpecialtyColor(specialty)} lighten-4 ${getSpecialtyColor(specialty)}-text`"
            >
              {{ specialty }}
            </span>
          </div>

          <h5>Approach</h5>
          <p>{{ selectedCounsellor.approach || 'Person-centered therapy with evidence-based techniques.' }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="bookSession(selectedCounsellor)" class="btn blue waves-effect waves-light">
          <i class="material-icons left">event</i>
          Book Session
        </button>
        <button class="modal-close btn-flat waves-effect waves-light">
          Close
        </button>
      </div>
    </div>

    <!-- Booking Modal -->
    <div id="booking-modal" class="modal modal-fixed-footer">
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
                <select
                  id="appointment-time"
                  v-model="booking.time"
                  :class="{ invalid: errors.time }"
                  required
                >
                  <option value="" disabled>Choose time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
                <label for="appointment-time">Preferred Time</label>
                <span v-if="errors.time" class="helper-text error-text">
                  {{ errors.time }}
                </span>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col s12 m6">
              <div class="input-field">
                <select
                  id="session-type"
                  v-model="booking.sessionType"
                  :class="{ invalid: errors.sessionType }"
                  required
                >
                  <option value="" disabled>Choose session type</option>
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="chat">Text Chat</option>
                </select>
                <label for="session-type">Session Type</label>
                <span v-if="errors.sessionType" class="helper-text error-text">
                  {{ errors.sessionType }}
                </span>
              </div>
            </div>

            <div class="col s12 m6">
              <div class="input-field">
                <select id="session-duration" v-model="booking.duration">
                  <option value="30">30 minutes</option>
                  <option value="60" selected>60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
                <label for="session-duration">Duration</label>
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
        </form>
      </div>

      <div class="modal-footer">
        <button
          @click="submitBooking"
          class="btn blue waves-effect waves-light"
          :disabled="submitting"
        >
          <i class="material-icons left">event</i>
          {{ submitting ? 'Booking...' : 'Confirm Booking' }}
        </button>
        <button class="modal-close btn-flat waves-effect waves-light">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAppointments } from '@/composables/useFirestore'
import { useCounsellorDirectory } from '@/composables/useCounsellorDirectory'
import { useExport } from '@/composables/useExport'
import { validateRequired } from '@/utils/validation'

const router = useRouter()
const { user } = useAuth()
const { createAppointment } = useAppointments()

const {
  loading,
  error,
  counsellors,
  searchQuery,
  selectedSpecialty,
  sortField,
  sortDirection,
  currentPage,
  pageSize,
  specialties,
  filteredCounsellors,
  paginatedCounsellors,
  totalPages,
  fetchCounsellors,
  searchCounsellors,
  filterBySpecialty,
  sortCounsellors,
  goToPage,
  resetFilters,
  formatRating,
  getRatingStars,
  getSpecialtyColor,
  exportCounsellorsCSV
} = useCounsellorDirectory()

// Export functionality
const { exporting, exportCounsellorsPDF, exportJSON } = useExport()

// Local state
const selectedCounsellor = ref(null)
const submitting = ref(false)

// Booking form state
const booking = reactive({
  date: '',
  time: '',
  sessionType: '',
  duration: '60',
  notes: ''
})

const errors = reactive({
  date: null,
  time: null,
  sessionType: null
})

// Computed properties
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Organize counsellors by type for display
const organizedCounsellors = computed(() => {
  const real = paginatedCounsellors.value.filter(c => !c.isDummy)
  const demo = paginatedCounsellors.value.filter(c => c.isDummy)

  return {
    real,
    demo,
    hasReal: real.length > 0,
    hasDemo: demo.length > 0
  }
})

const hasResults = computed(() => filteredCounsellors.value.length > 0)

const sessionTypes = computed(() => [
  'Video Call',
  'Phone Call',
  'In-Person',
  'Group Sessions'
])

// Methods
const handleSearch = () => {
  searchCounsellors(searchQuery.value)
}

const handleSpecialtyFilter = () => {
  filterBySpecialty(selectedSpecialty.value)
}

const handleSortChange = () => {
  sortCounsellors(sortField.value)
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const truncateBio = (bio) => {
  if (!bio) return 'Experienced counsellor ready to help you on your mental health journey.'
  return bio.length > 120 ? bio.substring(0, 120) + '...' : bio
}

const viewProfile = (counsellor) => {
  selectedCounsellor.value = counsellor
  const modal = M.Modal.getInstance(document.getElementById('counsellor-profile-modal'))
  modal.open()
}

const bookSession = (counsellor) => {
  // Check if user is authenticated and is a youth user
  if (!user.value) {
    M.toast({ html: 'Please log in to book a session', classes: 'red' })
    router.push('/login')
    return
  }

  if (user.value.role !== 'youth') {
    M.toast({ html: 'Only youth users can book sessions', classes: 'red' })
    return
  }

  selectedCounsellor.value = counsellor

  // Reset booking form
  booking.date = ''
  booking.time = ''
  booking.sessionType = ''
  booking.duration = '60'
  booking.notes = ''

  // Clear errors
  errors.date = null
  errors.time = null
  errors.sessionType = null

  // Open booking modal
  const modal = M.Modal.getInstance(document.getElementById('booking-modal'))
  modal.open()

  // Reinitialize selects
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('#booking-modal select'))
  }, 100)
}

const validateBooking = () => {
  errors.date = validateRequired(booking.date, 'Date')
  errors.time = validateRequired(booking.time, 'Time')
  errors.sessionType = validateRequired(booking.sessionType, 'Session Type')

  return !errors.date && !errors.time && !errors.sessionType
}

const submitBooking = async () => {
  if (!validateBooking()) {
    return
  }

  submitting.value = true

  try {
    const appointmentData = {
      userId: user.value.uid,
      counsellorId: selectedCounsellor.value.id,
      counsellorName: selectedCounsellor.value.displayName,
      userName: user.value.displayName || user.value.email,
      userEmail: user.value.email,
      userProfilePicture: user.value.profilePicture || '',
      appointmentDate: new Date(`${booking.date}T${booking.time}`),
      sessionType: booking.sessionType,
      duration: parseInt(booking.duration),
      userNotes: booking.notes,
      status: 'scheduled',
      cost: calculateCost(),
      paymentStatus: 'pending',
      reminderSent: false,
      createdAt: new Date()
    }

    await createAppointment(appointmentData)

    // Close modal
    const modal = M.Modal.getInstance(document.getElementById('booking-modal'))
    modal.close()

    M.toast({ html: 'Appointment booked successfully!', classes: 'teal' })

    // Redirect to appointments page
    setTimeout(() => {
      router.push('/my-appointments')
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
  const hourlyRate = selectedCounsellor.value.hourlyRate || 80
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

// Export methods
const exportCSV = () => {
  try {
    const result = exportCounsellorsCSV()
    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error exporting CSV: ' + err.message, classes: 'red' })
  }
}

const exportPDF = async () => {
  try {
    const filters = {
      searchQuery: searchQuery.value,
      selectedSpecialty: selectedSpecialty.value
    }

    const result = await exportCounsellorsPDF(filteredCounsellors.value, filters)
    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error exporting PDF: ' + err.message, classes: 'red' })
  }
}

const exportJSONData = () => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      filters: {
        searchQuery: searchQuery.value,
        selectedSpecialty: selectedSpecialty.value,
        sortField: sortField.value,
        sortDirection: sortDirection.value
      },
      totalCounsellors: filteredCounsellors.value.length,
      counsellors: filteredCounsellors.value.map(counsellor => ({
        id: counsellor.id,
        displayName: counsellor.displayName,
        email: counsellor.email,
        bio: counsellor.bio,
        specializations: counsellor.specializations,
        experience: counsellor.experience,
        averageRating: counsellor.averageRating,
        totalRatings: counsellor.totalRatings,
        hourlyRate: counsellor.hourlyRate,
        sessionTypes: counsellor.sessionTypes,
        languages: counsellor.languages,
        licenseNumber: counsellor.licenseNumber,
        licenseState: counsellor.licenseState,
        availability: counsellor.availability,
        responseTime: counsellor.responseTime
      }))
    }

    const filename = `counsellors-directory-${new Date().toISOString().split('T')[0]}.json`
    const result = exportJSON(exportData, filename)

    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error exporting JSON: ' + err.message, classes: 'red' })
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      M.FormSelect.init(document.querySelectorAll('select'))
      M.Modal.init(document.querySelectorAll('.modal'))
    }, 100)
  }

  // Fetch counsellors data
  await fetchCounsellors()
})
</script>

<style scoped>
.counsellor-directory {
  padding: 2rem 0;
}

.counsellor-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s ease-in-out;
}

.counsellor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Demo badge styling */
.demo-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.demo-badge .chip {
  font-size: 0.75rem;
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  font-weight: 500;
}

.demo-badge-modal {
  margin-bottom: 15px;
}

.demo-badge-modal .chip {
  font-size: 0.85rem;
  padding: 0 12px;
  font-weight: 500;
}

.modal-header {
  margin-bottom: 20px;
}

/* Section headers */
.section-header {
  color: #26a69a;
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.section-header.demo-section {
  color: #2196f3;
}

.section-header i {
  margin-right: 8px;
}

/* Demo counsellor cards styling */
.counsellor-card:has(.demo-badge) {
  border-left: 4px solid #2196f3;
}

.counsellor-card:has(.demo-badge):hover {
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
}

/* Real counsellor cards styling */
.counsellor-card:not(:has(.demo-badge)) {
  border-left: 4px solid #26a69a;
}

.counsellor-card:not(:has(.demo-badge)):hover {
  box-shadow: 0 8px 25px rgba(38, 166, 154, 0.15);
}

.counsellor-image {
  height: 200px;
  object-fit: cover;
}

.availability-badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-content {
  flex-grow: 1;
  padding-bottom: 0;
}

.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stars {
  margin-right: 0.5rem;
}

.rating-text {
  font-size: 0.9rem;
}

.experience {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.bio {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.specialties {
  margin-bottom: 1rem;
}

.chip.tiny {
  font-size: 0.7rem;
  height: 20px;
  line-height: 20px;
  margin: 0.1rem;
}

.response-time {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 0;
}

.material-icons.tiny {
  font-size: 1rem;
  margin-right: 0.25rem;
}

.card-action {
  padding-top: 1rem;
}

.card-action .btn {
  margin-bottom: 0.5rem;
}

.pagination-wrapper {
  margin-top: 2rem;
}

.modal .rating-section {
  margin-bottom: 1rem;
}

.modal .specialties {
  margin-bottom: 1.5rem;
}

@media only screen and (max-width: 600px) {
  .card-action .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .card-action .btn.right {
    float: none;
  }
}

.export-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.export-controls .btn {
  min-width: 80px;
}

@media (max-width: 768px) {
  .export-controls {
    justify-content: center;
    margin-bottom: 1rem;
  }

  .export-controls .btn {
    min-width: 70px;
    font-size: 0.8rem;
  }
}
</style>
