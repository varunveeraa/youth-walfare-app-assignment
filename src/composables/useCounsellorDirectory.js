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
        counsellor.displayName?.toLowerCase().includes(query) ||
        counsellor.bio?.toLowerCase().includes(query) ||
        counsellor.specializations?.some(specialty =>
          specialty.toLowerCase().includes(query)
        )
      )
    }

    // Apply specialty filter
    if (selectedSpecialty.value) {
      filtered = filtered.filter(counsellor =>
        counsellor.specializations?.includes(selectedSpecialty.value)
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

  // Dummy counsellor data for demonstration
  const getDummyCounsellors = () => {
    return [
      {
        id: 'dummy-1',
        displayName: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@example.com',
        bio: 'Experienced clinical psychologist specializing in anxiety and depression. Over 10 years of helping young adults navigate life challenges.',
        specializations: ['Anxiety Support', 'Depression Counseling', 'Stress Management'],
        experience: 10,
        averageRating: 4.8,
        totalRatings: 127,
        hourlyRate: 120,
        sessionTypes: ['Video Call', 'Phone Call', 'In-Person'],
        languages: ['English', 'Spanish'],
        licenseNumber: 'PSY12345',
        licenseState: 'NSW',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available Today',
        responseTime: 'Within 2 hours',
        isDummy: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dummy-2',
        displayName: 'Dr. Michael Chen',
        email: 'michael.chen@example.com',
        bio: 'Licensed therapist with expertise in relationship counseling and family therapy. Passionate about helping youth build healthy relationships.',
        specializations: ['Relationship Issues', 'Family Conflicts', 'Social Anxiety'],
        experience: 8,
        averageRating: 4.6,
        totalRatings: 89,
        hourlyRate: 110,
        sessionTypes: ['Video Call', 'In-Person'],
        languages: ['English', 'Mandarin'],
        licenseNumber: 'LMF67890',
        licenseState: 'VIC',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available Tomorrow',
        responseTime: 'Within 4 hours',
        isDummy: true,
        createdAt: new Date('2024-01-02')
      },
      {
        id: 'dummy-3',
        displayName: 'Dr. Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        bio: 'Specialist in trauma recovery and PTSD treatment. Dedicated to creating safe spaces for healing and growth.',
        specializations: ['Trauma Recovery', 'PTSD', 'Self-Esteem Building'],
        experience: 12,
        averageRating: 4.9,
        totalRatings: 156,
        hourlyRate: 140,
        sessionTypes: ['Video Call', 'Phone Call', 'In-Person'],
        languages: ['English', 'Spanish', 'Portuguese'],
        licenseNumber: 'PSY54321',
        licenseState: 'QLD',
        profileImage: 'https://images.unsplash.com/photo-1594824388853-d0c2b7b5e6b7?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available Today',
        responseTime: 'Within 1 hour',
        isDummy: true,
        createdAt: new Date('2024-01-03')
      },
      {
        id: 'dummy-4',
        displayName: 'Dr. James Thompson',
        email: 'james.thompson@example.com',
        bio: 'Addiction counselor and behavioral therapist. Specializes in helping young people overcome substance abuse and develop healthy coping mechanisms.',
        specializations: ['Addiction Support', 'Anger Management', 'Stress Management'],
        experience: 15,
        averageRating: 4.7,
        totalRatings: 203,
        hourlyRate: 130,
        sessionTypes: ['Video Call', 'In-Person', 'Group Sessions'],
        languages: ['English'],
        licenseNumber: 'LAC98765',
        licenseState: 'NSW',
        profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available This Week',
        responseTime: 'Within 6 hours',
        isDummy: true,
        createdAt: new Date('2024-01-04')
      },
      {
        id: 'dummy-5',
        displayName: 'Dr. Lisa Park',
        email: 'lisa.park@example.com',
        bio: 'Eating disorder specialist and nutritional psychologist. Helps young adults develop healthy relationships with food and body image.',
        specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem Building'],
        experience: 9,
        averageRating: 4.8,
        totalRatings: 94,
        hourlyRate: 125,
        sessionTypes: ['Video Call', 'Phone Call'],
        languages: ['English', 'Korean'],
        licenseNumber: 'PSY11111',
        licenseState: 'SA',
        profileImage: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available Tomorrow',
        responseTime: 'Within 3 hours',
        isDummy: true,
        createdAt: new Date('2024-01-05')
      },
      {
        id: 'dummy-6',
        displayName: 'Dr. Robert Wilson',
        email: 'robert.wilson@example.com',
        bio: 'Career counselor and life coach. Specializes in helping young adults navigate career transitions and academic pressures.',
        specializations: ['Career Guidance', 'Academic Pressure', 'Life Transitions'],
        experience: 11,
        averageRating: 4.5,
        totalRatings: 78,
        hourlyRate: 115,
        sessionTypes: ['Video Call', 'In-Person', 'Phone Call'],
        languages: ['English', 'French'],
        licenseNumber: 'LPC22222',
        licenseState: 'WA',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
        isActive: true,
        availability: 'Available Next Week',
        responseTime: 'Within 8 hours',
        isDummy: true,
        createdAt: new Date('2024-01-06')
      }
    ]
  }

  // Methods
  const fetchCounsellors = async () => {
    loading.value = true
    error.value = null

    try {
      // Get all active counsellor profiles from Firestore
      const counsellorsRef = collection(db, COLLECTIONS.COUNSELLOR_PROFILES)
      const q = query(
        counsellorsRef,
        where('isActive', '==', true)
        // Note: orderBy('createdAt', 'desc') temporarily removed until index builds
        // Will be restored once Firestore composite index is ready
      )

      const querySnapshot = await getDocs(q)
      const realCounsellors = []

      // Process real counsellors from Firestore
      for (const doc of querySnapshot.docs) {
        const counsellorData = doc.data()
        const counsellorId = doc.id

        // Calculate average rating
        const averageRating = await calculateAverageRating(counsellorId)
        const totalRatings = await getTotalRatings(counsellorId)

        realCounsellors.push({
          id: counsellorId,
          ...counsellorData,
          averageRating: averageRating,
          totalRatings: totalRatings,
          // Add computed fields
          availability: getAvailabilityStatus(counsellorData),
          responseTime: getResponseTime(counsellorData),
          isDummy: false
        })
      }

      // Sort real counsellors by createdAt desc (client-side until index is ready)
      realCounsellors.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
        return dateB - dateA
      })

      // Get dummy counsellors
      const dummyCounsellors = getDummyCounsellors()

      // Combine real counsellors first, then dummy counsellors
      const allCounsellors = [...realCounsellors, ...dummyCounsellors]

      counsellors.value = allCounsellors

    } catch (err) {
      error.value = err.message

      // If there's an error fetching real data, still show dummy data
      const dummyCounsellors = getDummyCounsellors()
      counsellors.value = dummyCounsellors
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

  // Export functionality
  const exportCounsellorsCSV = () => {
    try {
      const csvContent = generateCounsellorCSV(filteredCounsellors.value)
      downloadCSV(csvContent, 'counsellors-directory.csv')
      return { success: true, message: 'Counsellors exported successfully' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const generateCounsellorCSV = (data) => {
    const headers = [
      'Name',
      'Email',
      'Specializations',
      'Experience (Years)',
      'Rating',
      'Total Reviews',
      'Hourly Rate',
      'Session Types',
      'Languages',
      'Response Time',
      'Availability',
      'License Number',
      'License State'
    ]

    const rows = data.map(counsellor => [
      counsellor.displayName || '',
      counsellor.email || '',
      counsellor.specializations?.join('; ') || '',
      counsellor.experience || 0,
      counsellor.averageRating?.toFixed(1) || '0.0',
      counsellor.totalRatings || 0,
      counsellor.hourlyRate ? `$${counsellor.hourlyRate}` : '',
      counsellor.sessionTypes?.join('; ') || '',
      counsellor.languages?.join('; ') || '',
      counsellor.responseTime || '',
      counsellor.availability || '',
      counsellor.licenseNumber || '',
      counsellor.licenseState || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    getSpecialtyColor,
    exportCounsellorsCSV
  }
}
