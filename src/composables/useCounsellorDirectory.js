import { ref, computed } from 'vue'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS } from '@/firebase/collections'

export const useCounsellorDirectory = () => {
  const loading = ref(false)
  const error = ref(null)
  const counsellors = ref([])
  const searchQuery = ref('')
  const selectedSpecialty = ref('')
  const sortField = ref('averageRating')
  const sortDirection = ref('desc')
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Available specialties for filtering
  const specialties = ref([
    'Anxiety Support',
    'Depression Counseling',
    'Stress Management',
    'Relationship Issues',
    'Academic Pressure',
    'Family Conflicts',
    'Self-Esteem Building',
    'Trauma Recovery',
    'Addiction Support',
    'Career Guidance',
    'Social Anxiety',
    'Eating Disorders',
    'Sleep Issues',
    'Anger Management',
    'Grief Counseling'
  ])

  // Computed properties
  const filteredCounsellors = computed(() => {
    let filtered = [...counsellors.value]

    // Apply search filter (name, bio, specialties)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(counsellor => 
        counsellor.name?.toLowerCase().includes(query) ||
        counsellor.bio?.toLowerCase().includes(query) ||
        counsellor.specialties?.some(specialty => 
          specialty.toLowerCase().includes(query)
        )
      )
    }

    // Apply specialty filter
    if (selectedSpecialty.value) {
      filtered = filtered.filter(counsellor => 
        counsellor.specialties?.includes(selectedSpecialty.value)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField.value]
      let bValue = b[sortField.value]

      // Handle different data types
      if (sortField.value === 'averageRating') {
        aValue = aValue || 0
        bValue = bValue || 0
      } else if (sortField.value === 'experience') {
        aValue = parseInt(aValue) || 0
        bValue = parseInt(bValue) || 0
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

      if (sortDirection.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })

  const paginatedCounsellors = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredCounsellors.value.slice(start, end)
  })

  const totalPages = computed(() => 
    Math.ceil(filteredCounsellors.value.length / pageSize.value)
  )

  // Methods
  const fetchCounsellors = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching counsellor directory...')

      // Get all active counsellor profiles
      const counsellorsRef = collection(db, COLLECTIONS.COUNSELLOR_PROFILES)
      const q = query(
        counsellorsRef,
        where('isActive', '==', true)
        // Note: orderBy('createdAt', 'desc') temporarily removed until index builds
        // Will be restored once Firestore composite index is ready
      )
      
      const querySnapshot = await getDocs(q)
      const fetchedCounsellors = []

      // Also fetch ratings for each counsellor
      for (const doc of querySnapshot.docs) {
        const counsellorData = doc.data()
        const counsellorId = doc.id

        // Calculate average rating
        const averageRating = await calculateAverageRating(counsellorId)
        const totalRatings = await getTotalRatings(counsellorId)

        fetchedCounsellors.push({
          id: counsellorId,
          ...counsellorData,
          averageRating: averageRating,
          totalRatings: totalRatings,
          // Add computed fields
          availability: getAvailabilityStatus(counsellorData),
          responseTime: getResponseTime(counsellorData)
        })
      }

      // Sort by createdAt desc (client-side until index is ready)
      fetchedCounsellors.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
        return dateB - dateA
      })

      counsellors.value = fetchedCounsellors
      console.log(`Fetched ${fetchedCounsellors.length} counsellors`)

    } catch (err) {
      console.error('Error fetching counsellors:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const calculateAverageRating = async (counsellorId) => {
    try {
      const ratingsRef = collection(db, COLLECTIONS.RATINGS)
      const q = query(ratingsRef, where('counsellorId', '==', counsellorId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return 0

      let totalRating = 0
      let count = 0

      querySnapshot.forEach((doc) => {
        const rating = doc.data()
        if (rating.rating && typeof rating.rating === 'number') {
          totalRating += rating.rating
          count++
        }
      })

      return count > 0 ? (totalRating / count) : 0
    } catch (err) {
      console.error('Error calculating average rating:', err)
      return 0
    }
  }

  const getTotalRatings = async (counsellorId) => {
    try {
      const ratingsRef = collection(db, COLLECTIONS.RATINGS)
      const q = query(ratingsRef, where('counsellorId', '==', counsellorId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (err) {
      console.error('Error getting total ratings:', err)
      return 0
    }
  }

  const searchCounsellors = (query) => {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
  }

  const filterBySpecialty = (specialty) => {
    selectedSpecialty.value = specialty
    currentPage.value = 1 // Reset to first page when filtering
  }

  const sortCounsellors = (field, direction = null) => {
    if (sortField.value === field && !direction) {
      // Toggle direction if same field
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = direction || 'desc'
    }
    currentPage.value = 1 // Reset to first page when sorting
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedSpecialty.value = ''
    sortField.value = 'averageRating'
    sortDirection.value = 'desc'
    currentPage.value = 1
  }

  // Utility functions
  const getAvailabilityStatus = (counsellorData) => {
    // This would check actual availability data
    // For now, return mock status
    const statuses = ['Available Today', 'Available This Week', 'Booking Full']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getResponseTime = (counsellorData) => {
    // This would check actual response time data
    // For now, return mock response time
    const times = ['Within 2 hours', 'Within 24 hours', 'Within 48 hours']
    return times[Math.floor(Math.random() * times.length)]
  }

  const formatRating = (rating) => {
    if (!rating || rating === 0) return 'No ratings yet'
    return rating.toFixed(1)
  }

  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push('star')
    }

    if (hasHalfStar) {
      stars.push('star_half')
    }

    while (stars.length < 5) {
      stars.push('star_border')
    }

    return stars
  }

  const getSpecialtyColor = (specialty) => {
    const colors = [
      'blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'indigo'
    ]
    const index = specialty.length % colors.length
    return colors[index]
  }

  return {
    // State
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

    // Computed
    filteredCounsellors,
    paginatedCounsellors,
    totalPages,

    // Methods
    fetchCounsellors,
    searchCounsellors,
    filterBySpecialty,
    sortCounsellors,
    goToPage,
    resetFilters,
    formatRating,
    getRatingStars,
    getSpecialtyColor
  }
}
