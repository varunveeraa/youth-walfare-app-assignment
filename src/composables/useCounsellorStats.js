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

  // Calculate sessions this month
  const calculateSessionsThisMonth = async (counsellorId) => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      
      const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS)
      const q = query(
        appointmentsRef,
        where('counsellorId', '==', counsellorId),
        where('status', '==', 'completed'),
        where('appointmentDate', '>=', startOfMonth),
        where('appointmentDate', '<=', endOfMonth)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
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

  // Calculate hours available from availability settings
  const calculateHoursAvailable = async (counsellorId) => {
    try {
      // Get counsellor settings for working hours
      const settingsRef = collection(db, COLLECTIONS.COUNSELLOR_SETTINGS || 'counsellorSettings')
      const settingsQuery = query(settingsRef, where('counsellorId', '==', counsellorId))
      const settingsSnapshot = await getDocs(settingsQuery)
      
      if (settingsSnapshot.empty) {
        return 0
      }
      
      const settings = settingsSnapshot.docs[0].data()
      const workingHours = settings.workingHours || {}
      
      // Calculate total hours per week
      let totalHours = 0
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      
      daysOfWeek.forEach(day => {
        if (workingHours[day] && workingHours[day].enabled) {
          const start = workingHours[day].start || '09:00'
          const end = workingHours[day].end || '17:00'
          
          // Simple hour calculation (assumes HH:MM format)
          const startHour = parseInt(start.split(':')[0])
          const endHour = parseInt(end.split(':')[0])
          const dayHours = Math.max(0, endHour - startHour)
          
          totalHours += dayHours
        }
      })
      
      return totalHours
    } catch (err) {
      console.error('Error calculating hours available:', err)
      return 0
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
