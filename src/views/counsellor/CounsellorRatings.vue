<template>
  <div class="counsellor-ratings">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>My Ratings & Reviews</h4>
          <p class="grey-text">View feedback from your clients and track your performance.</p>
        </div>
      </div>
      
      <!-- Rating Summary -->
      <div class="row">
        <div class="col s12 m6">
          <div class="card">
            <div class="card-content center-align">
              <h5>Overall Rating</h5>
              <div class="rating-display-large">
                <span class="rating-number">{{ overallRating.toFixed(1) }}</span>
                <div class="stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="material-icons star large"
                    :class="star <= overallRating ? 'amber-text' : 'grey-text text-lighten-2'"
                  >
                    star
                  </i>
                </div>
                <p class="grey-text">Based on {{ totalReviews }} reviews</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col s12 m6">
          <div class="card">
            <div class="card-content">
              <h5>Rating Breakdown</h5>
              <RatingSystem 
                mode="display"
                :average-rating="overallRating"
                :total-ratings="totalReviews"
                :rating-breakdown="ratingBreakdown"
                :show-breakdown="true"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Category Ratings -->
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <h5>Performance Categories</h5>
              <div class="row">
                <div class="col s12 m4 center-align">
                  <h6>Communication</h6>
                  <div class="category-score">
                    <span class="score">{{ categoryAverages.communication.toFixed(1) }}</span>
                    <div class="stars">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        class="material-icons star"
                        :class="star <= categoryAverages.communication ? 'amber-text' : 'grey-text text-lighten-2'"
                      >
                        star
                      </i>
                    </div>
                  </div>
                </div>
                
                <div class="col s12 m4 center-align">
                  <h6>Helpfulness</h6>
                  <div class="category-score">
                    <span class="score">{{ categoryAverages.helpfulness.toFixed(1) }}</span>
                    <div class="stars">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        class="material-icons star"
                        :class="star <= categoryAverages.helpfulness ? 'amber-text' : 'grey-text text-lighten-2'"
                      >
                        star
                      </i>
                    </div>
                  </div>
                </div>
                
                <div class="col s12 m4 center-align">
                  <h6>Professionalism</h6>
                  <div class="category-score">
                    <span class="score">{{ categoryAverages.professionalism.toFixed(1) }}</span>
                    <div class="stars">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        class="material-icons star"
                        :class="star <= categoryAverages.professionalism ? 'amber-text' : 'grey-text text-lighten-2'"
                      >
                        star
                      </i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="row">
        <div class="col s12 m6">
          <div class="input-field">
            <select v-model="filterRating" @change="handleFilterChange">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <label>Filter by Rating</label>
          </div>
        </div>
        
        <div class="col s12 m6">
          <div class="input-field">
            <select v-model="sortBy" @change="handleSortChange">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
            <label>Sort By</label>
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
        <p>Loading reviews...</p>
      </div>
      
      <!-- Reviews List -->
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <h5>Recent Reviews</h5>
              <RatingSystem 
                mode="reviews"
                :reviews="filteredReviews"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Load More Button -->
      <div v-if="hasMore" class="center-align">
        <button 
          @click="loadMore" 
          class="btn waves-effect waves-light teal"
          :disabled="loading"
        >
          Load More Reviews
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRatings } from '@/composables/useFirestore'
import { where, orderBy, limit } from 'firebase/firestore'
import RatingSystem from '@/components/RatingSystem.vue'

const { user } = useAuth()
const { getAllRatings, loading, error } = useRatings()

// Reactive data
const reviews = ref([])
const filterRating = ref('')
const sortBy = ref('newest')
const hasMore = ref(true)
const currentLimit = ref(20)

// Computed properties
const overallRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

const totalReviews = computed(() => reviews.value.length)

const ratingBreakdown = computed(() => {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(review => {
    breakdown[review.rating]++
  })
  return breakdown
})

const categoryAverages = computed(() => {
  const categories = { communication: 0, helpfulness: 0, professionalism: 0 }
  const counts = { communication: 0, helpfulness: 0, professionalism: 0 }
  
  reviews.value.forEach(review => {
    if (review.communication) {
      categories.communication += review.communication
      counts.communication++
    }
    if (review.helpfulness) {
      categories.helpfulness += review.helpfulness
      counts.helpfulness++
    }
    if (review.professionalism) {
      categories.professionalism += review.professionalism
      counts.professionalism++
    }
  })
  
  return {
    communication: counts.communication > 0 ? categories.communication / counts.communication : 0,
    helpfulness: counts.helpfulness > 0 ? categories.helpfulness / counts.helpfulness : 0,
    professionalism: counts.professionalism > 0 ? categories.professionalism / counts.professionalism : 0
  }
})

const filteredReviews = computed(() => {
  let filtered = [...reviews.value]
  
  // Filter by rating
  if (filterRating.value) {
    filtered = filtered.filter(review => review.rating === parseInt(filterRating.value))
  }
  
  // Sort reviews
  switch (sortBy.value) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'highest':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'lowest':
      filtered.sort((a, b) => a.rating - b.rating)
      break
    default: // newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  return filtered
})

// Methods
const loadReviews = async () => {
  try {
    const constraints = [
      where('counsellorId', '==', user.value.uid),
      orderBy('createdAt', 'desc'),
      limit(currentLimit.value)
    ]
    
    const fetchedReviews = await getAllRatings(constraints)
    reviews.value = fetchedReviews
    hasMore.value = fetchedReviews.length === currentLimit.value
  } catch (err) {
    console.error('Error loading reviews:', err)
  }
}

const handleFilterChange = () => {
  // Filter is handled by computed property
}

const handleSortChange = () => {
  // Sort is handled by computed property
}

const loadMore = () => {
  currentLimit.value += 20
  loadReviews()
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'))
  
  // Load reviews
  await loadReviews()
  
  // Add mock data if no reviews exist
  if (reviews.value.length === 0) {
    reviews.value = getMockReviews()
  }
})

// Mock data for demonstration
const getMockReviews = () => [
  {
    id: '1',
    rating: 5,
    review: 'Dr. Johnson was incredibly helpful and understanding. She provided practical strategies that really made a difference in managing my anxiety.',
    communication: 5,
    helpfulness: 5,
    professionalism: 5,
    reviewerName: 'Sarah M.',
    isAnonymous: false,
    createdAt: new Date('2024-01-15'),
    counsellorId: user.value.uid
  },
  {
    id: '2',
    rating: 4,
    review: 'Great session, felt heard and supported. Would recommend to others dealing with similar issues.',
    communication: 4,
    helpfulness: 4,
    professionalism: 5,
    reviewerName: 'Anonymous',
    isAnonymous: true,
    createdAt: new Date('2024-01-10'),
    counsellorId: user.value.uid
  },
  {
    id: '3',
    rating: 5,
    review: 'Professional, empathetic, and knowledgeable. The techniques shared have been very beneficial.',
    communication: 5,
    helpfulness: 5,
    professionalism: 5,
    reviewerName: 'Mike T.',
    isAnonymous: false,
    createdAt: new Date('2024-01-08'),
    counsellorId: user.value.uid
  }
]
</script>

<style scoped>
.counsellor-ratings {
  padding: 2rem 0;
}

.rating-display-large {
  padding: 1rem;
}

.rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: #26a69a;
  display: block;
  margin-bottom: 0.5rem;
}

.stars .star.large {
  font-size: 2rem;
}

.category-score {
  margin: 1rem 0;
}

.category-score .score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #26a69a;
  display: block;
  margin-bottom: 0.25rem;
}

.stars {
  display: flex;
  justify-content: center;
  align-items: center;
}

.star {
  font-size: 1.2rem;
}

@media only screen and (max-width: 600px) {
  .rating-number {
    font-size: 2rem;
  }
  
  .stars .star.large {
    font-size: 1.5rem;
  }
  
  .category-score .score {
    font-size: 1.2rem;
  }
}
</style>
