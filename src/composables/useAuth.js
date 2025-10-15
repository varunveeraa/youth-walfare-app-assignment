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
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: userData.displayName
      })
      
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
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc)
      
      return userCredential
    } catch (err) {
      error.value = err.message
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
      
      await signOut(auth)
      user.value = null
    } catch (err) {
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
      if (firebaseUser) {
        // User is signed in
        const userData = await getUserData(firebaseUser.uid)
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          ...userData
        }
      } else {
        // User is signed out
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
