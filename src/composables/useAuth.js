import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword as establishUserCredentials,
  signInWithEmailAndPassword as validateUserCredentials,
  signOut as terminateUserSession,
  onAuthStateChanged as monitorAuthenticationChanges,
  updateProfile as modifyUserProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

// Global authentication state repository
const authenticatedUserData = ref(null)
const operationInProgress = ref(true)
const systemErrorNotification = ref(null)

export const useAuth = () => {
  // Session validation computations
  const userSessionActive = computed(() => {
    const isActive = !!authenticatedUserData.value
    console.log('userSessionActive computed:', isActive, 'user:', authenticatedUserData.value)
    return isActive
  })
  const extractUserRole = computed(() => authenticatedUserData.value?.role || null)
  const isYouthUserType = computed(() => extractUserRole.value === 'youth')
  const isCounsellorUserType = computed(() => extractUserRole.value === 'counsellor')
  const isAdministratorType = computed(() => extractUserRole.value === 'admin')

  // Clear system notifications
  const clearSystemNotifications = () => {
    systemErrorNotification.value = null
  }

  // Establish new user registration
  const establishNewUserAccount = async (emailAddress, userPassword, userMetadata) => {
    try {
      operationInProgress.value = true
      systemErrorNotification.value = null

      console.log('Commencing user registration process...', { emailAddress, userMetadata })

      // Generate authentication credentials
      const registrationOutcome = await establishUserCredentials(auth, emailAddress, userPassword)
      const registeredUser = registrationOutcome.user

      console.log('Authentication credentials established:', registeredUser.uid)

      // Configure user profile attributes
      await modifyUserProfile(registeredUser, {
        displayName: userMetadata.displayName
      })

      console.log('User profile attributes configured')

      // Persist user information to database
      const userDocumentData = {
        uid: registeredUser.uid,
        email: registeredUser.email,
        displayName: userMetadata.displayName,
        role: userMetadata.role || 'youth',
        accountCreated: new Date(),
        lastModified: new Date(),
        ...userMetadata
      }

      console.log('Persisting user data to database...', userDocumentData)

      await setDoc(doc(db, 'users', registeredUser.uid), userDocumentData)

      console.log('User data persistence completed')

      return registrationOutcome
    } catch (registrationError) {
      console.error('User registration process failed:', {
        errorCode: registrationError.code,
        errorMessage: registrationError.message,
        errorStack: registrationError.stack
      })

      // Convert technical error codes to user-comprehensible messages
      let userFriendlyNotification = registrationError.message

      switch (registrationError.code) {
        case 'auth/email-already-in-use':
          userFriendlyNotification = 'This email address is already associated with an existing account. Please use the sign-in option or try a different email.'
          break
        case 'auth/invalid-email':
          userFriendlyNotification = 'The provided email address format is not valid. Please verify and try again.'
          break
        case 'auth/weak-password':
          userFriendlyNotification = 'The password strength is insufficient. Please create a password with at least 6 characters.'
          break
        case 'permission-denied':
          userFriendlyNotification = 'System access denied. Please check your internet connectivity and attempt again.'
          break
        case 'auth/network-request-failed':
          userFriendlyNotification = 'Network connectivity issue detected. Please verify your connection and retry.'
          break
        default:
          if (registrationError.message.includes('Missing or insufficient permissions')) {
            userFriendlyNotification = 'Database connectivity issue. Please wait briefly and attempt again.'
          }
      }

      systemErrorNotification.value = userFriendlyNotification
      throw registrationError
    } finally {
      operationInProgress.value = false
    }
  }

  // Perform user credential validation
  const performUserAuthentication = async (emailAddress, userPassword) => {
    try {
      operationInProgress.value = true
      systemErrorNotification.value = null

      console.log('Starting authentication for:', emailAddress)
      const authenticationResult = await validateUserCredentials(auth, emailAddress, userPassword)
      console.log('Firebase auth successful, waiting for user data...')

      // Wait for the auth state change and user data to be loaded
      await new Promise((resolve) => {
        const authStateListener = monitorAuthenticationChanges(auth, async (verifiedUser) => {
          if (verifiedUser) {
            console.log('Auth state changed, loading user profile...')
            // Load user profile data
            const userProfileData = await retrieveUserProfileData(verifiedUser.uid)
            authenticatedUserData.value = {
              uid: verifiedUser.uid,
              email: verifiedUser.email,
              displayName: verifiedUser.displayName,
              ...userProfileData
            }
            console.log('User data loaded in login:', authenticatedUserData.value)
            authStateListener()
            resolve()
          }
        })
      })

      console.log('Login process completed successfully')
      return authenticationResult
    } catch (authError) {
      console.error('Login error:', authError)
      systemErrorNotification.value = authError.message
      throw authError
    } finally {
      operationInProgress.value = false
    }
  }

  // Terminate active user session
  const terminateActiveSession = async () => {
    try {
      operationInProgress.value = true
      systemErrorNotification.value = null

      console.log('Commencing session termination process...')
      console.log('Current authenticated user:', authenticatedUserData.value)

      await terminateUserSession(auth)
      authenticatedUserData.value = null

      console.log('Session termination completed, user state reset')
    } catch (sessionError) {
      console.error('Session termination process failed:', sessionError)
      systemErrorNotification.value = sessionError.message
      throw sessionError
    } finally {
      operationInProgress.value = false
    }
  }

  // Retrieve user profile data from database
  const retrieveUserProfileData = async (userIdentifier) => {
    try {
      const userDocument = await getDoc(doc(db, 'users', userIdentifier))
      if (userDocument.exists()) {
        return userDocument.data()
      }
      return null
    } catch (retrievalError) {
      console.error('User profile data retrieval failed:', retrievalError)
      return null
    }
  }

  // Initialize authentication state monitoring
  const initializeAuthenticationMonitoring = () => {
    monitorAuthenticationChanges(auth, async (verifiedUser) => {
      console.log('Authentication state transition detected:', verifiedUser ? 'User session established' : 'User session terminated')

      if (verifiedUser) {
        // Active user session detected
        console.log('Loading user profile data for:', verifiedUser.uid)
        const userProfileData = await retrieveUserProfileData(verifiedUser.uid)
        authenticatedUserData.value = {
          uid: verifiedUser.uid,
          email: verifiedUser.email,
          displayName: verifiedUser.displayName,
          ...userProfileData
        }
        console.log('User profile data loaded:', authenticatedUserData.value)
      } else {
        // No active user session
        console.log('Clearing authenticated user data')
        authenticatedUserData.value = null
      }
      operationInProgress.value = false
    })
  }

  // Authentication monitoring will be initialized from App.vue

  return {
    // Reactive state properties
    user: computed(() => authenticatedUserData.value),
    loading: computed(() => {
      console.log('loading computed:', operationInProgress.value)
      return operationInProgress.value
    }),
    error: computed(() => systemErrorNotification.value),

    // Session validation properties
    isAuthenticated: userSessionActive,
    userRole: extractUserRole,
    isYouthUser: isYouthUserType,
    isCounsellor: isCounsellorUserType,
    isAdmin: isAdministratorType,

    // Authentication operation methods
    register: establishNewUserAccount,
    login: performUserAuthentication,
    logout: terminateActiveSession,
    clearError: clearSystemNotifications,
    getUserData: retrieveUserProfileData,
    initAuth: initializeAuthenticationMonitoring
  }
}
