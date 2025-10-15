import { ref, computed, onMounted } from 'vue'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

// Global state for authentication
const user = ref(null)
const loading = ref(true)
const error = ref(null)

export const useAuth = () => {
  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isYouthUser = computed(() => userRole.value === 'youth')
  const isCounsellor = computed(() => userRole.value === 'counsellor')
  const isAdmin = computed(() => userRole.value === 'admin')

  // Clear error function
  const clearError = () => {
    error.value = null
  }

  // Register new user
  const register = async (email, password, userData) => {
    try {
      loading.value = true
      error.value = null

      console.log('Starting registration process...', { email, userData })

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      console.log('Firebase user created successfully:', firebaseUser.uid)

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: userData.displayName
      })

      console.log('Display name updated successfully')

      // Create user document in Firestore
      const userDoc = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.displayName,
        role: userData.role || 'youth',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData
      }

      console.log('Creating user document in Firestore...', userDoc)

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc)

      console.log('User document created successfully in Firestore')

      return userCredential
    } catch (err) {
      console.error('Registration error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      })

      // Provide user-friendly error messages
      let userFriendlyMessage = err.message

      switch (err.code) {
        case 'auth/email-already-in-use':
          userFriendlyMessage = 'This email address is already registered. Please use a different email or try logging in.'
          break
        case 'auth/invalid-email':
          userFriendlyMessage = 'Please enter a valid email address.'
          break
        case 'auth/weak-password':
          userFriendlyMessage = 'Password is too weak. Please choose a stronger password.'
          break
        case 'permission-denied':
          userFriendlyMessage = 'Permission denied. Please check your internet connection and try again.'
          break
        case 'auth/network-request-failed':
          userFriendlyMessage = 'Network error. Please check your internet connection and try again.'
          break
        default:
          if (err.message.includes('Missing or insufficient permissions')) {
            userFriendlyMessage = 'Database permission error. Please try again in a moment.'
          }
      }

      error.value = userFriendlyMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout user
  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('Starting logout process...')
      console.log('Current user before logout:', user.value)

      await signOut(auth)
      user.value = null

      console.log('Logout successful, user cleared')
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get user data from Firestore
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (err) {
      console.error('Error fetching user data:', err)
      return null
    }
  }

  // Initialize auth state listener
  const initAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out')

      if (firebaseUser) {
        // User is signed in
        console.log('Loading user data for:', firebaseUser.uid)
        const userData = await getUserData(firebaseUser.uid)
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          ...userData
        }
        console.log('User data loaded:', user.value)
      } else {
        // User is signed out
        console.log('Clearing user data')
        user.value = null
      }
      loading.value = false
    })
  }

  // Initialize on mount
  onMounted(() => {
    initAuth()
  })

  return {
    // State
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    isAuthenticated,
    userRole,
    isYouthUser,
    isCounsellor,
    isAdmin,
    
    // Methods
    register,
    login,
    logout,
    clearError,
    getUserData,
    initAuth
  }
}
