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

      // Generate authentication credentials
      const registrationOutcome = await establishUserCredentials(auth, emailAddress, userPassword)
      const registeredUser = registrationOutcome.user

      // Configure user profile attributes
      await modifyUserProfile(registeredUser, {
        displayName: userMetadata.displayName
      })

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

      await setDoc(doc(db, 'users', registeredUser.uid), userDocumentData)

      return registrationOutcome
    } catch (registrationError) {


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

      const authenticationResult = await validateUserCredentials(auth, emailAddress, userPassword)

      // Wait for the auth state change and user data to be loaded
      await new Promise((resolve) => {
        const authStateListener = monitorAuthenticationChanges(auth, async (verifiedUser) => {
          if (verifiedUser) {
            // Load user profile data
            const userProfileData = await retrieveUserProfileData(verifiedUser.uid)
            authenticatedUserData.value = {
              uid: verifiedUser.uid,
              email: verifiedUser.email,
              displayName: verifiedUser.displayName,
              ...userProfileData
            }
            authStateListener()
            resolve()
          }
        })
      })

      return authenticationResult
    } catch (authError) {
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

      await terminateUserSession(auth)
      authenticatedUserData.value = null
    } catch (sessionError) {
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
      return null
    }
  }

  // Initialize authentication state monitoring
  const initializeAuthenticationMonitoring = () => {
    monitorAuthenticationChanges(auth, async (verifiedUser) => {
      if (verifiedUser) {
        // Active user session detected
        const userProfileData = await retrieveUserProfileData(verifiedUser.uid)
        authenticatedUserData.value = {
          uid: verifiedUser.uid,
          email: verifiedUser.email,
          displayName: verifiedUser.displayName,
          ...userProfileData
        }
      } else {
        // No active user session
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
