<template>
  <div class="community">
    <div class="container">
      <!-- Header Section -->
      <div class="row">
        <div class="col s12 m8">
          <h4>Community Forum</h4>
          <p class="grey-text">Connect with peers, share experiences, and support each other.</p>
        </div>
        <div class="col s12 m4 right-align">
          <button
            @click="openNewPostModal"
            class="btn waves-effect waves-light teal"
          >
            <i class="material-icons left">add</i>
            New Post
          </button>
        </div>
      </div>

      <!-- Categories and Filters -->
      <div class="row">
        <div class="col s12 m6">
          <div class="input-field">
            <select v-model="selectedCategory" @change="handleCategoryChange">
              <option value="">All Categories</option>
              <option value="general">General Discussion</option>
              <option value="anxiety">Anxiety Support</option>
              <option value="depression">Depression Support</option>
              <option value="stress">Stress Management</option>
              <option value="relationships">Relationships</option>
              <option value="success">Success Stories</option>
            </select>
            <label>Category</label>
          </div>
        </div>
        <div class="col s12 m6">
          <div class="input-field">
            <select v-model="sortBy" @change="handleSortChange">
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="active">Most Active</option>
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
        <p>Loading posts...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">
        <i class="material-icons left">error</i>
        {{ error }}
      </div>

      <!-- Pinned Posts -->
      <div v-if="pinnedPosts.length > 0" class="row">
        <div class="col s12">
          <h5>
            <i class="material-icons left">push_pin</i>
            Pinned Posts
          </h5>
          <div
            v-for="post in pinnedPosts"
            :key="post.id"
            class="card pinned-post"
          >
            <div class="card-content">
              <div class="post-header">
                <span class="card-title">{{ post.title }}</span>
                <span class="badge teal white-text">Pinned</span>
              </div>
              <p>{{ post.content.substring(0, 200) }}{{ post.content.length > 200 ? '...' : '' }}</p>
              <div class="post-meta">
                <span class="chip">{{ post.category }}</span>
                <span class="grey-text">
                  by {{ post.isAnonymous ? 'Anonymous' : post.authorName }}
                </span>
                <span class="grey-text">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>
            <div class="card-action">
              <a @click="viewPost(post)" class="teal-text">Read More</a>
              <span class="grey-text right">
                <i class="material-icons tiny">comment</i> {{ post.commentCount }}
                <i class="material-icons tiny">favorite</i> {{ post.likes }}
                <i class="material-icons tiny">visibility</i> {{ post.views }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Forum Posts -->
      <div class="row">
        <div class="col s12">
          <h5>Recent Discussions</h5>

          <div v-if="filteredPosts.length === 0 && !loading" class="center-align">
            <i class="material-icons large grey-text">forum</i>
            <p class="grey-text">No posts found. Be the first to start a discussion!</p>
          </div>

          <div
            v-for="post in filteredPosts"
            :key="post.id"
            class="card forum-post"
          >
            <div class="card-content">
              <span class="card-title">{{ post.title }}</span>
              <p>{{ post.content.substring(0, 300) }}{{ post.content.length > 300 ? '...' : '' }}</p>
              <div class="post-meta">
                <span class="chip">{{ post.category }}</span>
                <span class="grey-text">
                  by {{ post.isAnonymous ? 'Anonymous' : post.authorName }}
                </span>
                <span class="grey-text">{{ formatDate(post.createdAt) }}</span>
                <span v-if="post.lastActivity !== post.createdAt" class="grey-text">
                  • Last activity {{ formatDate(post.lastActivity) }}
                </span>
              </div>
            </div>
            <div class="card-action">
              <a @click="viewPost(post)" class="teal-text">View Discussion</a>
              <a @click="likePost(post)" class="grey-text">
                <i class="material-icons tiny">{{ post.isLiked ? 'favorite' : 'favorite_border' }}</i>
                {{ post.likes }}
              </a>
              <span class="grey-text right">
                <i class="material-icons tiny">comment</i> {{ post.commentCount }}
                <i class="material-icons tiny">visibility</i> {{ post.views }}
              </span>
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
          Load More Posts
        </button>
      </div>
    </div>

    <!-- New Post Modal -->
    <div id="new-post-modal" class="modal">
      <div class="modal-content">
        <h4>Create New Post</h4>
        <form @submit.prevent="submitPost">
          <div class="input-field">
            <input
              id="post-title"
              type="text"
              v-model="newPost.title"
              :class="{ invalid: errors.title }"
              required
            >
            <label for="post-title">Post Title</label>
            <span v-if="errors.title" class="helper-text error-text">
              {{ errors.title }}
            </span>
          </div>

          <div class="input-field">
            <select v-model="newPost.category" required>
              <option value="" disabled>Choose a category</option>
              <option value="general">General Discussion</option>
              <option value="anxiety">Anxiety Support</option>
              <option value="depression">Depression Support</option>
              <option value="stress">Stress Management</option>
              <option value="relationships">Relationships</option>
              <option value="success">Success Stories</option>
            </select>
            <label>Category</label>
          </div>

          <div class="input-field">
            <textarea
              id="post-content"
              class="materialize-textarea"
              v-model="newPost.content"
              :class="{ invalid: errors.content }"
              required
            ></textarea>
            <label for="post-content">Your message</label>
            <span v-if="errors.content" class="helper-text error-text">
              {{ errors.content }}
            </span>
          </div>

          <p>
            <label>
              <input type="checkbox" v-model="newPost.isAnonymous" />
              <span>Post anonymously</span>
            </label>
          </p>

          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Cancel</a>
            <button
              type="submit"
              class="waves-effect waves-light btn teal"
              :disabled="submitting"
            >
              <span v-if="submitting">
                <i class="material-icons left">hourglass_empty</i>
                Posting...
              </span>
              <span v-else>
                <i class="material-icons left">send</i>
                Post
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <div id="post-detail-modal" class="modal modal-fixed-footer">
      <div class="modal-content" v-if="selectedPost">
        <h4>{{ selectedPost.title }}</h4>
        <div class="post-meta">
          <span class="chip">{{ selectedPost.category }}</span>
          <span class="grey-text">
            by {{ selectedPost.isAnonymous ? 'Anonymous' : selectedPost.authorName }}
          </span>
          <span class="grey-text">{{ formatDate(selectedPost.createdAt) }}</span>
        </div>
        <div class="divider" style="margin: 1rem 0;"></div>
        <p>{{ selectedPost.content }}</p>

        <!-- Comments section would go here -->
        <div class="comments-section">
          <h6>Comments ({{ selectedPost.commentCount }})</h6>
          <p class="grey-text center-align">Comments feature coming soon...</p>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Close</a>
        <a @click="likePost(selectedPost)" class="waves-effect waves-light btn teal">
          <i class="material-icons left">{{ selectedPost?.isLiked ? 'favorite' : 'favorite_border' }}</i>
          Like
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useForumPosts } from '@/composables/useFirestore'
import { validateTextContent, validateRequired } from '@/utils/validation'
import { where, orderBy, limit } from 'firebase/firestore'

const { user } = useAuth()
const { createPost, getAllPosts, loading, error } = useForumPosts()

// Reactive data
const posts = ref([])
const selectedCategory = ref('')
const sortBy = ref('recent')
const selectedPost = ref(null)
const hasMore = ref(true)
const currentLimit = ref(10)
const submitting = ref(false)

const newPost = reactive({
  title: '',
  content: '',
  category: '',
  isAnonymous: false
})

const errors = reactive({
  title: null,
  content: null
})

// Computed properties
const pinnedPosts = computed(() =>
  posts.value.filter(post => post.isPinned)
)

const filteredPosts = computed(() => {
  let filtered = posts.value.filter(post => !post.isPinned)

  if (selectedCategory.value) {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }

  // Sort posts
  switch (sortBy.value) {
    case 'popular':
      filtered.sort((a, b) => b.likes - a.likes)
      break
    case 'active':
      filtered.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      break
    default: // recent
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return filtered
})

// Methods
const loadPosts = async () => {
  try {
    const constraints = [
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(currentLimit.value)
    ]

    const fetchedPosts = await getAllPosts(constraints)

    // Add mock isLiked property
    posts.value = fetchedPosts.map(post => ({
      ...post,
      isLiked: false
    }))

    hasMore.value = fetchedPosts.length === currentLimit.value
  } catch (err) {
    console.error('Error loading posts:', err)
  }
}

const handleCategoryChange = () => {
  // Filter is handled by computed property
}

const handleSortChange = () => {
  // Sort is handled by computed property
}

const openNewPostModal = () => {
  // Reset form
  newPost.title = ''
  newPost.content = ''
  newPost.category = ''
  newPost.isAnonymous = false
  errors.title = null
  errors.content = null

  // Open modal
  const modal = M.Modal.getInstance(document.getElementById('new-post-modal'))
  modal.open()

  // Reinitialize select after modal opens
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('#new-post-modal select'))
  }, 100)
}

const validateForm = () => {
  errors.title = validateRequired(newPost.title, 'Title')
  errors.content = validateTextContent(newPost.content, 10, 2000)

  return !errors.title && !errors.content
}

const submitPost = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true

    const postData = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      authorId: user.value.uid,
      authorName: newPost.isAnonymous ? 'Anonymous' : user.value.displayName,
      isAnonymous: newPost.isAnonymous,
      isModerated: false,
      isApproved: true, // Auto-approve for now
      isPinned: false,
      views: 0,
      likes: 0,
      commentCount: 0,
      lastActivity: new Date(),
      tags: []
    }

    await createPost(postData)

    // Close modal
    const modal = M.Modal.getInstance(document.getElementById('new-post-modal'))
    modal.close()

    // Reload posts
    await loadPosts()

    M.toast({ html: 'Post created successfully!', classes: 'teal' })
  } catch (err) {
    console.error('Error creating post:', err)
    M.toast({ html: 'Error creating post. Please try again.', classes: 'red' })
  } finally {
    submitting.value = false
  }
}

const viewPost = (post) => {
  selectedPost.value = post
  // Increment view count
  post.views++

  // Open modal
  const modal = M.Modal.getInstance(document.getElementById('post-detail-modal'))
  modal.open()
}

const likePost = (post) => {
  // Toggle like status
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const loadMore = () => {
  currentLimit.value += 10
  loadPosts()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - d)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return d.toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'))
  M.Modal.init(document.querySelectorAll('.modal'))

  // Load initial posts
  await loadPosts()

  // Add mock data if no posts exist
  if (posts.value.length === 0) {
    posts.value = getMockPosts()
  }
})

// Mock data for demonstration
const getMockPosts = () => [
  {
    id: '1',
    title: 'Welcome to the MindBridge Community!',
    content: 'This is a safe space for young people to connect, share experiences, and support each other on their mental health journey. Please be kind and respectful to all members.',
    category: 'general',
    authorName: 'MindBridge Team',
    isAnonymous: false,
    isPinned: true,
    isApproved: true,
    views: 245,
    likes: 34,
    commentCount: 12,
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date('2024-01-15'),
    isLiked: false
  },
  {
    id: '2',
    title: 'Dealing with exam anxiety',
    content: 'I have been struggling with severe anxiety during exams. My heart races, I can\'t concentrate, and I feel like I\'m going to fail even though I\'ve studied hard. Has anyone else experienced this? What helped you cope?',
    category: 'anxiety',
    authorName: 'Anonymous',
    isAnonymous: true,
    isPinned: false,
    isApproved: true,
    views: 89,
    likes: 15,
    commentCount: 8,
    createdAt: new Date('2024-01-10'),
    lastActivity: new Date('2024-01-12'),
    isLiked: false
  },
  {
    id: '3',
    title: 'Small victory: I asked for help today',
    content: 'After months of struggling alone, I finally reached out to a counselor today. It was scary but I\'m proud of myself for taking this step. To anyone hesitating - you\'re worth the help and support.',
    category: 'success',
    authorName: 'Sarah M.',
    isAnonymous: false,
    isPinned: false,
    isApproved: true,
    views: 156,
    likes: 42,
    commentCount: 18,
    createdAt: new Date('2024-01-08'),
    lastActivity: new Date('2024-01-11'),
    isLiked: false
  }
]
</script>

<style scoped>
.community {
  padding: 2rem 0;
}

.pinned-post {
  border-left: 4px solid #ff9800;
}

.forum-post {
  transition: transform 0.3s ease;
}

.forum-post:hover {
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-meta {
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

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
  margin-right: 0.25rem;
}

.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
}

.comments-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.modal {
  max-height: 90%;
}

.modal-content {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

@media only screen and (max-width: 600px) {
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .post-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
