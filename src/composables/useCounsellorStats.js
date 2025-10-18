import { ref, computed } from 'vue'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS } from '@/firebase/collections'

export const useCounsellorStats = () => {
  const loading = ref(false)
  const error = ref(null)
  
  // Individual stat refs
  const totalClients = ref(0)
  const sessionsThisMonth = ref(0)
  const averageRating = ref(0)
  const hoursAvailable = ref(0)
  
  // Combined stats object for easy binding
  const practiceStats = computed(() => ({
    totalClients: totalClients.value,
    sessionsThisMonth: sessionsThisMonth.value,
    averageRating: averageRating.value.toFixed(1),
    hoursAvailable: hoursAvailable.value
  }))

  // Calculate total unique clients from appointments
  const calculateTotalClients = async (counsellorId) => {
    try {
      const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS)
      const q = query(
        appointmentsRef,
        where('counsellorId', '==', counsellorId),
        where('status', 'in', ['completed', 'confirmed'])
      )
      
      const querySnapshot = await getDocs(q)
      const uniqueClients = new Set()
      
      querySnapshot.forEach((doc) => {
        const appointment = doc.data()
        if (appointment.userId) {
          uniqueClients.add(appointment.userId)
        }
      })
      
      return uniqueClients.size
    } catch (err) {
      console.error('Error calculating total clients:', err)
      return 0
    }
  }

  // Calculate sessions this month (simplified to avoid index requirements)
  const calculateSessionsThisMonth = async (counsellorId) => {
    try {
      const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS)
      const q = query(
        appointmentsRef,
        where('counsellorId', '==', counsellorId)
      )

      const querySnapshot = await getDocs(q)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

      let count = 0
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const appointmentDate = data.appointmentDate?.toDate()
        if (appointmentDate &&
            appointmentDate >= startOfMonth &&
            appointmentDate <= endOfMonth &&
            data.status === 'completed') {
          count++
        }
      })

      return count
    } catch (err) {
      console.error('Error calculating sessions this month:', err)
      return 0
    }
  }

  // Calculate average rating from ratings collection
  const calculateAverageRating = async (counsellorId) => {
    try {
      const ratingsRef = collection(db, COLLECTIONS.RATINGS)
      const q = query(
        ratingsRef,
        where('counsellorId', '==', counsellorId)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return 0
      }
      
      let totalRating = 0
      let count = 0
      
      querySnapshot.forEach((doc) => {
        const rating = doc.data()
        if (rating.rating && typeof rating.rating === 'number') {
          totalRating += rating.rating
          count++
        }
      })
      
      return count > 0 ? totalRating / count : 0
    } catch (err) {
      console.error('Error calculating average rating:', err)
      return 0
    }
  }

  // Calculate hours available from availability settings (simplified)
  const calculateHoursAvailable = async (counsellorId) => {
    try {
      // Return a default value to avoid permission issues
      // This can be updated when proper Firebase rules are set up
      return 40 // Default 40 hours per week
    } catch (err) {
      console.error('Error calculating hours available:', err)
      return 40 // Default fallback
    }
  }

  // Main function to fetch all stats
  const fetchCounsellorStats = async (counsellorId) => {
    if (!counsellorId) {
      console.warn('No counsellor ID provided for stats calculation')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('Fetching counsellor stats for:', counsellorId)

      // Fetch all stats in parallel for better performance
      const [clients, sessions, rating, hours] = await Promise.all([
        calculateTotalClients(counsellorId),
        calculateSessionsThisMonth(counsellorId),
        calculateAverageRating(counsellorId),
        calculateHoursAvailable(counsellorId)
      ])

      // Update reactive refs
      totalClients.value = clients
      sessionsThisMonth.value = sessions
      averageRating.value = rating
      hoursAvailable.value = hours

      console.log('Counsellor stats calculated:', {
        totalClients: clients,
        sessionsThisMonth: sessions,
        averageRating: rating,
        hoursAvailable: hours
      })

    } catch (err) {
      console.error('Error fetching counsellor stats:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Reset stats
  const resetStats = () => {
    totalClients.value = 0
    sessionsThisMonth.value = 0
    averageRating.value = 0
    hoursAvailable.value = 0
    error.value = null
  }

  return {
    // Reactive data
    loading,
    error,
    practiceStats,
    totalClients,
    sessionsThisMonth,
    averageRating,
    hoursAvailable,
    
    // Methods
    fetchCounsellorStats,
    resetStats
  }
}
