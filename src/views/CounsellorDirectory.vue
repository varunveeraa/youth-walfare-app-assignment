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
      <div v-if="!loading && !error" class="row">
        <div 
          v-for="counsellor in paginatedCounsellors" 
          :key="counsellor.id"
          class="col s12 m6 l4"
        >
          <div class="card counsellor-card hoverable">
            <!-- Profile Image -->
            <div class="card-image">
              <img 
                :src="counsellor.profileImage || '/api/placeholder/300/200'" 
                :alt="counsellor.name"
                class="counsellor-image"
              >
              <span class="card-title">{{ counsellor.name }}</span>
              <div class="availability-badge">
                <span class="chip green lighten-4 green-text">
                  <i class="material-icons left tiny">schedule</i>
                  {{ counsellor.availability }}
                </span>
              </div>
            </div>

            <!-- Profile Content -->
            <div class="card-content">
              <!-- Rating -->
              <div class="rating-section">
                <div class="stars">
                  <i 
                    v-for="(star, index) in getRatingStars(counsellor.averageRating)" 
                    :key="index"
                    class="material-icons tiny yellow-text"
                  >
                    {{ star }}
                  </i>
                </div>
                <span class="rating-text">
                  {{ formatRating(counsellor.averageRating) }}
                  <span class="grey-text">({{ counsellor.totalRatings }} reviews)</span>
                </span>
              </div>

              <!-- Experience -->
              <p class="experience">
                <i class="material-icons left tiny">work</i>
                {{ counsellor.experience || 'New' }} years experience
              </p>

              <!-- Bio -->
              <p class="bio">{{ truncateBio(counsellor.bio) }}</p>

              <!-- Specialties -->
              <div class="specialties">
                <span 
                  v-for="specialty in counsellor.specialties?.slice(0, 3)" 
                  :key="specialty"
                  class="chip tiny"
                  :class="`${getSpecialtyColor(specialty)} lighten-4 ${getSpecialtyColor(specialty)}-text`"
                >
                  {{ specialty }}
                </span>
                <span 
                  v-if="counsellor.specialties?.length > 3" 
                  class="chip tiny grey lighten-4 grey-text"
                >
                  +{{ counsellor.specialties.length - 3 }} more
                </span>
              </div>

              <!-- Response Time -->
              <p class="response-time grey-text">
                <i class="material-icons left tiny">schedule</i>
                Responds {{ counsellor.responseTime }}
              </p>
            </div>

            <!-- Actions -->
            <div class="card-action">
              <button 
                @click="viewProfile(counsellor)" 
                class="btn waves-effect waves-light teal"
              >
                <i class="material-icons left">visibility</i>
                View Profile
              </button>
              <button 
                @click="bookSession(counsellor)" 
                class="btn waves-effect waves-light blue right"
              >
                <i class="material-icons left">event</i>
                Book Session
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="paginatedCounsellors.length === 0" class="col s12">
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
          <h4>{{ selectedCounsellor.name }}</h4>
          
          <div class="row">
            <div class="col s12 m4">
              <img 
                :src="selectedCounsellor.profileImage || '/api/placeholder/200/200'" 
                :alt="selectedCounsellor.name"
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
              v-for="specialty in selectedCounsellor.specialties" 
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCounsellorDirectory } from '@/composables/useCounsellorDirectory'

const router = useRouter()

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
  getSpecialtyColor
} = useCounsellorDirectory()

// Local state
const selectedCounsellor = ref(null)

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

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
  // Navigate to booking page with counsellor ID
  router.push(`/book-appointment?counsellor=${counsellor.id}`)
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
</style>
