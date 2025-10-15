<template>
  <div class="rating-system">
    <!-- Rating Display (Read-only) -->
    <div v-if="mode === 'display'" class="rating-display">
      <div class="stars-container">
        <div class="stars">
          <i 
            v-for="star in 5" 
            :key="star"
            class="material-icons star"
            :class="getStarClass(star)"
          >
            star
          </i>
        </div>
        <span class="rating-text">
          {{ averageRating.toFixed(1) }} 
          <span class="grey-text">({{ totalRatings }} {{ totalRatings === 1 ? 'review' : 'reviews' }})</span>
        </span>
      </div>
      
      <!-- Rating Breakdown -->
      <div v-if="showBreakdown && ratingBreakdown" class="rating-breakdown">
        <div 
          v-for="(count, rating) in ratingBreakdown" 
          :key="rating"
          class="rating-bar"
        >
          <span class="rating-label">{{ rating }} star{{ rating > 1 ? 's' : '' }}</span>
          <div class="progress-container">
            <div class="progress">
              <div 
                class="determinate teal" 
                :style="{ width: getPercentage(count) + '%' }"
              ></div>
            </div>
          </div>
          <span class="rating-count">{{ count }}</span>
        </div>
      </div>
    </div>
    
    <!-- Rating Input (Interactive) -->
    <div v-else-if="mode === 'input'" class="rating-input">
      <h6>Rate this counsellor</h6>
      <div class="stars-container">
        <div class="stars interactive">
          <i 
            v-for="star in 5" 
            :key="star"
            class="material-icons star clickable"
            :class="getInputStarClass(star)"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
          >
            star
          </i>
        </div>
        <span class="rating-text">
          {{ currentRating > 0 ? getRatingText(currentRating) : 'Click to rate' }}
        </span>
      </div>
      
      <!-- Category Ratings -->
      <div v-if="showCategories" class="category-ratings">
        <div class="category-rating">
          <label>Communication</label>
          <div class="stars interactive small">
            <i 
              v-for="star in 5" 
              :key="star"
              class="material-icons star clickable"
              :class="star <= categoryRatings.communication ? 'amber-text' : 'grey-text text-lighten-2'"
              @click="setCategoryRating('communication', star)"
            >
              star
            </i>
          </div>
        </div>
        
        <div class="category-rating">
          <label>Helpfulness</label>
          <div class="stars interactive small">
            <i 
              v-for="star in 5" 
              :key="star"
              class="material-icons star clickable"
              :class="star <= categoryRatings.helpfulness ? 'amber-text' : 'grey-text text-lighten-2'"
              @click="setCategoryRating('helpfulness', star)"
            >
              star
            </i>
          </div>
        </div>
        
        <div class="category-rating">
          <label>Professionalism</label>
          <div class="stars interactive small">
            <i 
              v-for="star in 5" 
              :key="star"
              class="material-icons star clickable"
              :class="star <= categoryRatings.professionalism ? 'amber-text' : 'grey-text text-lighten-2'"
              @click="setCategoryRating('professionalism', star)"
            >
              star
            </i>
          </div>
        </div>
      </div>
      
      <!-- Review Text -->
      <div class="input-field">
        <textarea 
          id="review-text" 
          class="materialize-textarea" 
          v-model="reviewText"
          :class="{ invalid: errors.review }"
        ></textarea>
        <label for="review-text">Write a review (optional)</label>
        <span v-if="errors.review" class="helper-text error-text">
          {{ errors.review }}
        </span>
      </div>
      
      <!-- Anonymous Option -->
      <p>
        <label>
          <input type="checkbox" v-model="isAnonymous" />
          <span>Submit anonymously</span>
        </label>
      </p>
      
      <!-- Submit Button -->
      <button 
        @click="submitRating"
        class="btn waves-effect waves-light teal"
        :disabled="currentRating === 0 || submitting"
      >
        <span v-if="submitting">
          <i class="material-icons left">hourglass_empty</i>
          Submitting...
        </span>
        <span v-else>
          <i class="material-icons left">star</i>
          Submit Rating
        </span>
      </button>
    </div>
    
    <!-- Reviews List -->
    <div v-if="mode === 'reviews'" class="reviews-list">
      <h6>Reviews</h6>
      
      <div v-if="reviews.length === 0" class="center-align">
        <i class="material-icons large grey-text">rate_review</i>
        <p class="grey-text">No reviews yet.</p>
      </div>
      
      <div 
        v-for="review in reviews" 
        :key="review.id"
        class="review-item card-panel"
      >
        <div class="review-header">
          <div class="stars small">
            <i 
              v-for="star in 5" 
              :key="star"
              class="material-icons star"
              :class="star <= review.rating ? 'amber-text' : 'grey-text text-lighten-2'"
            >
              star
            </i>
          </div>
          <span class="reviewer-name">
            {{ review.isAnonymous ? 'Anonymous' : review.reviewerName }}
          </span>
          <span class="review-date grey-text">
            {{ formatDate(review.createdAt) }}
          </span>
        </div>
        
        <p v-if="review.review" class="review-text">{{ review.review }}</p>
        
        <!-- Category Ratings -->
        <div v-if="review.communication || review.helpfulness || review.professionalism" class="category-display">
          <div v-if="review.communication" class="category-item">
            <span class="category-label">Communication:</span>
            <div class="stars tiny inline">
              <i 
                v-for="star in review.communication" 
                :key="star"
                class="material-icons star amber-text"
              >
                star
              </i>
            </div>
          </div>
          
          <div v-if="review.helpfulness" class="category-item">
            <span class="category-label">Helpfulness:</span>
            <div class="stars tiny inline">
              <i 
                v-for="star in review.helpfulness" 
                :key="star"
                class="material-icons star amber-text"
              >
                star
              </i>
            </div>
          </div>
          
          <div v-if="review.professionalism" class="category-item">
            <span class="category-label">Professionalism:</span>
            <div class="stars tiny inline">
              <i 
                v-for="star in review.professionalism" 
                :key="star"
                class="material-icons star amber-text"
              >
                star
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits } from 'vue'
import { validateTextContent } from '@/utils/validation'

const props = defineProps({
  mode: {
    type: String,
    default: 'display', // 'display', 'input', 'reviews'
    validator: (value) => ['display', 'input', 'reviews'].includes(value)
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingBreakdown: {
    type: Object,
    default: () => ({})
  },
  showBreakdown: {
    type: Boolean,
    default: false
  },
  showCategories: {
    type: Boolean,
    default: false
  },
  reviews: {
    type: Array,
    default: () => []
  },
  counsellorId: {
    type: String,
    default: ''
  },
  appointmentId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['rating-submitted'])

// Reactive data
const currentRating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const isAnonymous = ref(false)
const submitting = ref(false)

const categoryRatings = reactive({
  communication: 0,
  helpfulness: 0,
  professionalism: 0
})

const errors = reactive({
  review: null
})

// Computed properties
const displayRating = computed(() => hoverRating.value || currentRating.value)

// Methods
const getStarClass = (star) => {
  return star <= props.averageRating ? 'amber-text' : 'grey-text text-lighten-2'
}

const getInputStarClass = (star) => {
  return star <= displayRating.value ? 'amber-text' : 'grey-text text-lighten-2'
}

const setRating = (rating) => {
  currentRating.value = rating
}

const setCategoryRating = (category, rating) => {
  categoryRatings[category] = rating
}

const getRatingText = (rating) => {
  const texts = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }
  return texts[rating] || ''
}

const getPercentage = (count) => {
  if (props.totalRatings === 0) return 0
  return (count / props.totalRatings) * 100
}

const validateForm = () => {
  errors.review = reviewText.value ? validateTextContent(reviewText.value, 1, 500) : null
  return !errors.review
}

const submitRating = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    submitting.value = true
    
    const ratingData = {
      rating: currentRating.value,
      review: reviewText.value,
      communication: categoryRatings.communication || null,
      helpfulness: categoryRatings.helpfulness || null,
      professionalism: categoryRatings.professionalism || null,
      isAnonymous: isAnonymous.value,
      counsellorId: props.counsellorId,
      appointmentId: props.appointmentId
    }
    
    emit('rating-submitted', ratingData)
    
    // Reset form
    currentRating.value = 0
    reviewText.value = ''
    isAnonymous.value = false
    categoryRatings.communication = 0
    categoryRatings.helpfulness = 0
    categoryRatings.professionalism = 0
    
  } catch (error) {
    console.error('Error submitting rating:', error)
  } finally {
    submitting.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.rating-system {
  margin: 1rem 0;
}

.stars-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  align-items: center;
}

.stars.small .star {
  font-size: 1rem;
}

.stars.tiny .star {
  font-size: 0.8rem;
}

.stars.inline {
  display: inline-flex;
}

.star {
  font-size: 1.5rem;
  transition: color 0.2s ease;
}

.star.clickable {
  cursor: pointer;
}

.star.clickable:hover {
  transform: scale(1.1);
}

.rating-text {
  font-size: 1rem;
  margin-left: 0.5rem;
}

.rating-breakdown {
  margin-top: 1rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.rating-label {
  min-width: 60px;
  font-size: 0.9rem;
}

.progress-container {
  flex-grow: 1;
}

.progress {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.rating-count {
  min-width: 30px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.category-ratings {
  margin: 1rem 0;
}

.category-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.category-rating label {
  min-width: 120px;
  font-size: 0.9rem;
}

.reviews-list {
  margin-top: 2rem;
}

.review-item {
  margin-bottom: 1rem;
  padding: 1rem;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-weight: 500;
}

.review-date {
  margin-left: auto;
  font-size: 0.9rem;
}

.review-text {
  margin: 0.5rem 0;
  line-height: 1.5;
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
  font-size: 0.8rem;
  color: #666;
}

.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
}

@media only screen and (max-width: 600px) {
  .rating-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .category-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .category-display {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
