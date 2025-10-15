<template>
  <div class="resources">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12">
          <h4>Mental Health Resources</h4>
          <p class="grey-text">Discover articles, tools, and guides to support your mental health journey.</p>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="row">
        <div class="col s12 m8">
          <div class="input-field">
            <i class="material-icons prefix">search</i>
            <input
              id="search"
              type="text"
              v-model="searchQuery"
              @input="handleSearch"
            >
            <label for="search">Search resources...</label>
          </div>
        </div>
        <div class="col s12 m4">
          <div class="input-field">
            <select v-model="selectedCategory" @change="handleCategoryChange">
              <option value="">All Categories</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress Management</option>
              <option value="relationships">Relationships</option>
              <option value="self-care">Self Care</option>
              <option value="coping">Coping Strategies</option>
            </select>
            <label>Category</label>
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
        <p>Loading resources...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
        <i class="material-icons left">error</i>
        {{ error }}
      </div>

      <!-- Featured Resources -->
      <div v-if="featuredResources.length > 0" class="row">
        <div class="col s12">
          <h5>Featured Resources</h5>
          <div class="row">
            <div
              v-for="resource in featuredResources"
              :key="resource.id"
              class="col s12 m6 l4"
            >
              <div class="card featured-card">
                <div class="card-image" v-if="resource.imageUrl">
                  <img :src="resource.imageUrl" :alt="resource.title">
                  <span class="card-title">{{ resource.title }}</span>
                </div>
                <div class="card-content">
                  <span v-if="!resource.imageUrl" class="card-title">{{ resource.title }}</span>
                  <p>{{ resource.description }}</p>
                  <div class="resource-meta">
                    <span class="chip">{{ resource.category }}</span>
                    <span class="grey-text">{{ resource.readTime }} min read</span>
                  </div>
                </div>
                <div class="card-action">
                  <a @click="viewResource(resource)" class="teal-text">Read More</a>
                  <a @click="likeResource(resource)" class="grey-text right">
                    <i class="material-icons">{{ resource.isLiked ? 'favorite' : 'favorite_border' }}</i>
                    {{ resource.likes }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Resources -->
      <div class="row">
        <div class="col s12">
          <h5>All Resources</h5>
          <div v-if="filteredResources.length === 0 && !loading" class="center-align">
            <i class="material-icons large grey-text">search_off</i>
            <p class="grey-text">No resources found matching your criteria.</p>
          </div>

          <div class="row">
            <div
              v-for="resource in filteredResources"
              :key="resource.id"
              class="col s12 m6 l4"
            >
              <div class="card resource-card">
                <div class="card-image" v-if="resource.imageUrl">
                  <img :src="resource.imageUrl" :alt="resource.title">
                </div>
                <div class="card-content">
                  <span class="card-title">{{ resource.title }}</span>
                  <p>{{ resource.description }}</p>
                  <div class="resource-meta">
                    <span class="chip">{{ resource.category }}</span>
                    <span class="grey-text">{{ resource.readTime }} min read</span>
                    <span class="grey-text">{{ resource.views }} views</span>
                  </div>
                </div>
                <div class="card-action">
                  <a @click="viewResource(resource)" class="teal-text">Read More</a>
                  <a @click="likeResource(resource)" class="grey-text right">
                    <i class="material-icons">{{ resource.isLiked ? 'favorite' : 'favorite_border' }}</i>
                    {{ resource.likes }}
                  </a>
                </div>
              </div>
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
          Load More Resources
        </button>
      </div>
    </div>

    <!-- Resource Modal -->
    <div id="resource-modal" class="modal modal-fixed-footer">
      <div class="modal-content" v-if="selectedResource">
        <h4>{{ selectedResource.title }}</h4>
        <div class="resource-meta">
          <span class="chip">{{ selectedResource.category }}</span>
          <span class="grey-text">{{ selectedResource.readTime }} min read</span>
          <span class="grey-text">By {{ selectedResource.authorName }}</span>
        </div>
        <div class="divider" style="margin: 1rem 0;"></div>
        <div v-html="selectedResource.content"></div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Close</a>
        <a @click="likeResource(selectedResource)" class="waves-effect waves-light btn teal">
          <i class="material-icons left">{{ selectedResource?.isLiked ? 'favorite' : 'favorite_border' }}</i>
          Like
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useResources } from '@/composables/useFirestore'
import { where, orderBy, limit } from 'firebase/firestore'

const { getAllResources, loading, error } = useResources()

// Reactive data
const resources = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedResource = ref(null)
const hasMore = ref(true)
const currentLimit = ref(12)

// Computed properties
const featuredResources = computed(() =>
  resources.value.filter(resource => resource.isFeatured).slice(0, 3)
)

const filteredResources = computed(() => {
  let filtered = resources.value.filter(resource => !resource.isFeatured)

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource =>
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  return filtered
})

// Methods
const loadResources = async () => {
  try {
    const constraints = [
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(currentLimit.value)
    ]

    const fetchedResources = await getAllResources(constraints)

    // Add mock isLiked property (in real app, this would come from user preferences)
    resources.value = fetchedResources.map(resource => ({
      ...resource,
      isLiked: false
    }))

    hasMore.value = fetchedResources.length === currentLimit.value
  } catch (err) {
    console.error('Error loading resources:', err)
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleCategoryChange = () => {
  // Filter is handled by computed property
}

const viewResource = (resource) => {
  selectedResource.value = resource
  // Increment view count (in real app, this would update the database)
  resource.views++

  // Open modal
  const modal = M.Modal.getInstance(document.getElementById('resource-modal'))
  modal.open()
}

const likeResource = (resource) => {
  // Toggle like status (in real app, this would update the database)
  resource.isLiked = !resource.isLiked
  resource.likes += resource.isLiked ? 1 : -1
}

const loadMore = () => {
  currentLimit.value += 12
  loadResources()
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'))
  M.Modal.init(document.querySelectorAll('.modal'))

  // Load initial resources
  await loadResources()

  // Add some mock data if no resources exist
  if (resources.value.length === 0) {
    resources.value = getMockResources()
  }
})

// Mock data for demonstration
const getMockResources = () => [
  {
    id: '1',
    title: 'Understanding Anxiety: A Beginner\'s Guide',
    description: 'Learn about anxiety symptoms, causes, and effective coping strategies.',
    content: '<p>Anxiety is a normal human emotion that everyone experiences from time to time...</p>',
    category: 'anxiety',
    tags: ['anxiety', 'coping', 'mental health'],
    authorName: 'Dr. Sarah Johnson',
    isPublished: true,
    isFeatured: true,
    readTime: 8,
    views: 1247,
    likes: 89,
    imageUrl: 'https://via.placeholder.com/400x200?text=Anxiety+Guide',
    isLiked: false
  },
  {
    id: '2',
    title: 'Mindfulness Techniques for Daily Stress',
    description: 'Simple mindfulness exercises you can practice anywhere to reduce stress.',
    content: '<p>Mindfulness is the practice of being present in the moment...</p>',
    category: 'stress',
    tags: ['mindfulness', 'stress', 'meditation'],
    authorName: 'Dr. Michael Chen',
    isPublished: true,
    isFeatured: true,
    readTime: 6,
    views: 892,
    likes: 67,
    imageUrl: 'https://via.placeholder.com/400x200?text=Mindfulness',
    isLiked: false
  },
  {
    id: '3',
    title: 'Building Healthy Relationships',
    description: 'Tips for creating and maintaining positive relationships in your life.',
    content: '<p>Healthy relationships are fundamental to our wellbeing...</p>',
    category: 'relationships',
    tags: ['relationships', 'communication', 'social'],
    authorName: 'Dr. Emily Rodriguez',
    isPublished: true,
    isFeatured: false,
    readTime: 10,
    views: 634,
    likes: 45,
    imageUrl: '',
    isLiked: false
  }
]
</script>

<style scoped>
.resources {
  padding: 2rem 0;
}

.featured-card {
  border-left: 4px solid #26a69a;
}

.resource-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-meta {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.chip {
  font-size: 0.8rem;
  height: 24px;
  line-height: 24px;
}

.card-image img {
  height: 200px;
  object-fit: cover;
}

.modal {
  max-height: 90%;
}

.modal-content {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

@media only screen and (max-width: 600px) {
  .resource-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
