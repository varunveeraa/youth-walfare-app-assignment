<template>
  <div class="rate-counsellor">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>Rate Your Session</h4>
          <p class="grey-text">Help others by sharing your experience with this counsellor.</p>
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
        <p>Loading appointment details...</p>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
        <i class="material-icons left">error</i>
        {{ error }}
      </div>
      
      <!-- Appointment Details -->
      <div v-if="appointment" class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <h5>Session Details</h5>
              <div class="row">
                <div class="col s12 m4 center-align">
                  <img 
                    :src="appointment.counsellorProfilePicture || '/api/placeholder/150/150'" 
                    :alt="appointment.counsellorName"
                    class="circle responsive-img counsellor-avatar"
                  >
                  <h6>{{ appointment.counsellorName }}</h6>
                </div>
                
                <div class="col s12 m8">
                  <div class="appointment-info">
                    <p><strong>Date:</strong> {{ formatDate(appointment.appointmentDate) }}</p>
                    <p><strong>Duration:</strong> {{ appointment.duration }} minutes</p>
                    <p><strong>Session Type:</strong> {{ appointment.sessionType }}</p>
                    <p><strong>Status:</strong> 
                      <span class="chip green lighten-4">{{ appointment.status }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Rating Form -->
      <div v-if="appointment && !hasExistingRating" class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <h5>Rate Your Experience</h5>
              
              <RatingSystem 
                mode="input"
                :show-categories="true"
                :counsellor-id="appointment.counsellorId"
                :appointment-id="appointment.id"
                @rating-submitted="handleRatingSubmitted"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Existing Rating Display -->
      <div v-if="existingRating" class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <h5>Your Rating</h5>
              <p class="grey-text">You have already rated this session.</p>
              
              <div class="existing-rating">
                <div class="stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="material-icons star"
                    :class="star <= existingRating.rating ? 'amber-text' : 'grey-text text-lighten-2'"
                  >
                    star
                  </i>
                </div>
                <span class="rating-text">{{ existingRating.rating }}/5 stars</span>
              </div>
              
              <div v-if="existingRating.review" class="review-text">
                <h6>Your Review:</h6>
                <p>{{ existingRating.review }}</p>
              </div>
              
              <div v-if="existingRating.communication || existingRating.helpfulness || existingRating.professionalism" class="category-ratings">
                <h6>Category Ratings:</h6>
                <div class="category-display">
                  <div v-if="existingRating.communication" class="category-item">
                    <span class="category-label">Communication:</span>
                    <div class="stars small inline">
                      <i 
                        v-for="star in existingRating.communication" 
                        :key="star"
                        class="material-icons star amber-text"
                      >
                        star
                      </i>
                    </div>
                  </div>
                  
                  <div v-if="existingRating.helpfulness" class="category-item">
                    <span class="category-label">Helpfulness:</span>
                    <div class="stars small inline">
                      <i 
                        v-for="star in existingRating.helpfulness" 
                        :key="star"
                        class="material-icons star amber-text"
                      >
                        star
                      </i>
                    </div>
                  </div>
                  
                  <div v-if="existingRating.professionalism" class="category-item">
                    <span class="category-label">Professionalism:</span>
                    <div class="stars small inline">
                      <i 
                        v-for="star in existingRating.professionalism" 
                        :key="star"
                        class="material-icons star amber-text"
                      >
                        star
                      </i>
                    </div>
                  </div>
                </div>
              </div>
              
              <p class="grey-text">Submitted on {{ formatDate(existingRating.createdAt) }}</p>
              
              <button 
                @click="editRating"
                class="btn-flat waves-effect waves-teal"
              >
                Edit Rating
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="row">
        <div class="col s12 center-align">
          <router-link to="/my-appointments" class="btn-flat waves-effect waves-teal">
            <i class="material-icons left">arrow_back</i>
            Back to Appointments
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAppointments, useRatings } from '@/composables/useFirestore'
import { where } from 'firebase/firestore'
import RatingSystem from '@/components/RatingSystem.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { getDocument: getAppointment, loading: appointmentLoading } = useAppointments()
const { createRating, updateRating, getAllRatings, loading: ratingLoading } = useRatings()

// Reactive data
const appointment = ref(null)
const existingRating = ref(null)
const error = ref(null)

// Computed properties
const loading = computed(() => appointmentLoading.value || ratingLoading.value)
const hasExistingRating = computed(() => !!existingRating.value)

// Methods
const loadAppointment = async () => {
  try {
    const appointmentId = route.params.appointmentId
    if (!appointmentId) {
      error.value = 'Appointment ID is required'
      return
    }
    
    const appointmentData = await getAppointment(appointmentId)
    if (!appointmentData) {
      error.value = 'Appointment not found'
      return
    }
    
    // Verify this appointment belongs to the current user
    if (appointmentData.userId !== user.value.uid) {
      error.value = 'You can only rate your own appointments'
      return
    }
    
    // Verify appointment is completed
    if (appointmentData.status !== 'completed') {
      error.value = 'You can only rate completed appointments'
      return
    }
    
    appointment.value = appointmentData
    
    // Check for existing rating
    await loadExistingRating()
  } catch (err) {
    console.error('Error loading appointment:', err)
    error.value = 'Failed to load appointment details'
  }
}

const loadExistingRating = async () => {
  try {
    const constraints = [
      where('appointmentId', '==', appointment.value.id),
      where('userId', '==', user.value.uid)
    ]
    
    const ratings = await getAllRatings(constraints)
    if (ratings.length > 0) {
      existingRating.value = ratings[0]
    }
  } catch (err) {
    console.error('Error loading existing rating:', err)
  }
}

const handleRatingSubmitted = async (ratingData) => {
  try {
    const fullRatingData = {
      ...ratingData,
      userId: user.value.uid,
      userName: user.value.displayName,
      appointmentId: appointment.value.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (existingRating.value) {
      // Update existing rating
      await updateRating(existingRating.value.id, {
        ...fullRatingData,
        updatedAt: new Date()
      })
      M.toast({ html: 'Rating updated successfully!', classes: 'teal' })
    } else {
      // Create new rating
      await createRating(fullRatingData)
      M.toast({ html: 'Rating submitted successfully!', classes: 'teal' })
    }
    
    // Reload to show updated rating
    await loadExistingRating()
  } catch (err) {
    console.error('Error submitting rating:', err)
    M.toast({ html: 'Error submitting rating. Please try again.', classes: 'red' })
  }
}

const editRating = () => {
  existingRating.value = null
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await loadAppointment()
  
  // Mock data if no appointment found
  if (!appointment.value && !error.value) {
    appointment.value = {
      id: 'mock-appointment-1',
      counsellorId: 'counsellor1',
      counsellorName: 'Dr. Sarah Johnson',
      counsellorProfilePicture: 'https://via.placeholder.com/150x150?text=Dr.+Sarah',
      userId: user.value.uid,
      appointmentDate: new Date('2024-01-15T14:00:00'),
      duration: 60,
      sessionType: 'video',
      status: 'completed'
    }
  }
})
</script>

<style scoped>
.rate-counsellor {
  padding: 2rem 0;
}

.counsellor-avatar {
  max-width: 150px;
  margin-bottom: 1rem;
}

.appointment-info p {
  margin: 0.5rem 0;
}

.existing-rating {
  margin: 1rem 0;
}

.stars {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stars.small .star {
  font-size: 1rem;
}

.stars.inline {
  display: inline-flex;
  margin-left: 0.5rem;
}

.star {
  font-size: 1.5rem;
}

.rating-text {
  margin-left: 0.5rem;
  font-size: 1rem;
}

.review-text {
  margin: 1rem 0;
}

.category-display {
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.category-label {
  font-size: 0.9rem;
  color: #666;
}

@media only screen and (max-width: 600px) {
  .category-display {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
