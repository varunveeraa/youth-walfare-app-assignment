import { ref, computed } from 'vue'
import { collection, getDocs, query, orderBy, limit, startAfter, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS } from '@/firebase/collections'

export const useUserManagement = () => {
  const loading = ref(false)
  const error = ref(null)
  const users = ref([])
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')
  const sortField = ref('createdAt')
  const sortDirection = ref('desc')
  const selectedRole = ref('')

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))
  
  const filteredUsers = computed(() => {
    let filtered = [...users.value]

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      )
    }

    // Apply role filter
    if (selectedRole.value) {
      filtered = filtered.filter(user => user.role === selectedRole.value)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField.value]
      let bValue = b[sortField.value]

      // Handle different data types
      if (sortField.value === 'createdAt' || sortField.value === 'lastLoginAt') {
        aValue = aValue ? new Date(aValue.seconds * 1000) : new Date(0)
        bValue = bValue ? new Date(bValue.seconds * 1000) : new Date(0)
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

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredUsers.value.slice(start, end)
  })

  // Methods
  const fetchUsers = async (page = 1) => {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching users for page:', page)

      // Get all users from Firestore
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      
      const querySnapshot = await getDocs(q)
      const fetchedUsers = []

      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        fetchedUsers.push({
          id: doc.id,
          ...userData,
          // Add computed fields
          status: getUserStatus(userData),
          lastActive: getLastActiveText(userData.lastLoginAt)
        })
      })

      users.value = fetchedUsers
      totalUsers.value = fetchedUsers.length
      currentPage.value = page

      console.log(`Fetched ${fetchedUsers.length} users`)

    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (userId, newRole) => {
    loading.value = true
    error.value = null

    try {
      console.log('Updating user role:', userId, newRole)

      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      })

      // Update local data
      const userIndex = users.value.findIndex(user => user.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].role = newRole
        users.value[userIndex].updatedAt = new Date()
      }

      console.log('User role updated successfully')
      return { success: true, message: 'User role updated successfully' }

    } catch (err) {
      console.error('Error updating user role:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    loading.value = true
    error.value = null

    try {
      console.log('Toggling user status:', userId, isActive)

      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        isActive: isActive,
        updatedAt: new Date()
      })

      // Update local data
      const userIndex = users.value.findIndex(user => user.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].isActive = isActive
        users.value[userIndex].updatedAt = new Date()
        users.value[userIndex].status = getUserStatus(users.value[userIndex])
      }

      console.log('User status updated successfully')
      return { success: true, message: 'User status updated successfully' }

    } catch (err) {
      console.error('Error updating user status:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    loading.value = true
    error.value = null

    try {
      console.log('Deleting user:', userId)

      // In a real app, you might want to soft delete or archive instead
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await deleteDoc(userRef)

      // Remove from local data
      users.value = users.value.filter(user => user.id !== userId)
      totalUsers.value = users.value.length

      console.log('User deleted successfully')
      return { success: true, message: 'User deleted successfully' }

    } catch (err) {
      console.error('Error deleting user:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const searchUsers = (query) => {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
  }

  const filterByRole = (role) => {
    selectedRole.value = role
    currentPage.value = 1 // Reset to first page when filtering
  }

  const sortUsers = (field, direction = null) => {
    if (sortField.value === field && !direction) {
      // Toggle direction if same field
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = direction || 'asc'
    }
    currentPage.value = 1 // Reset to first page when sorting
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const exportUsers = () => {
    try {
      const csvContent = generateCSV(filteredUsers.value)
      downloadCSV(csvContent, 'mindbridge-users.csv')
      return { success: true, message: 'Users exported successfully' }
    } catch (err) {
      console.error('Error exporting users:', err)
      return { success: false, message: err.message }
    }
  }

  // Utility functions
  const getUserStatus = (userData) => {
    if (userData.isActive === false) return 'Inactive'
    if (userData.lastLoginAt) {
      const lastLogin = new Date(userData.lastLoginAt.seconds * 1000)
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLogin > 30) return 'Dormant'
      if (daysSinceLogin > 7) return 'Inactive'
    }
    return 'Active'
  }

  const getLastActiveText = (lastLoginAt) => {
    if (!lastLoginAt) return 'Never'
    const lastLogin = new Date(lastLoginAt.seconds * 1000)
    const now = new Date()
    const diffMs = now - lastLogin
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const generateCSV = (data) => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Join Date', 'Last Active']
    const rows = data.map(user => [
      user.displayName || '',
      user.email || '',
      user.role || '',
      user.status || '',
      user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '',
      user.lastActive || ''
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
  }

  return {
    // State
    loading,
    error,
    users,
    totalUsers,
    currentPage,
    pageSize,
    searchQuery,
    sortField,
    sortDirection,
    selectedRole,

    // Computed
    totalPages,
    filteredUsers,
    paginatedUsers,

    // Methods
    fetchUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    searchUsers,
    filterByRole,
    sortUsers,
    goToPage,
    exportUsers
  }
}
