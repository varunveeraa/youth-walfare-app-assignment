import { ref, computed } from 'vue'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  usersCollection,
  resourcesCollection,
  appointmentsCollection,
  ratingsCollection,
  counsellorProfilesCollection,
  COLLECTIONS
} from '@/firebase/collections'

export const useFirestore = () => {
  const databaseTransactionInProgress = ref(false)
  const databaseOperationFailure = ref(null)

  const clearOperationFailures = () => {
    databaseOperationFailure.value = null
  }

  // Database transaction operations
  const insertNewRecord = async (collectionReference, documentData) => {
    try {
      databaseTransactionInProgress.value = true
      databaseOperationFailure.value = null
      const generatedRecordId = await createDocument(collectionReference, documentData)
      return generatedRecordId
    } catch (insertionError) {
      databaseOperationFailure.value = insertionError.message
      throw insertionError
    } finally {
      databaseTransactionInProgress.value = false
    }
  }

  const updateExistingRecord = async (collectionIdentifier, documentIdentifier, modificationData) => {
    try {
      databaseTransactionInProgress.value = true
      databaseOperationFailure.value = null
      await updateDocument(collectionIdentifier, documentIdentifier, modificationData)
      return true
    } catch (updateError) {
      databaseOperationFailure.value = updateError.message
      throw updateError
    } finally {
      databaseTransactionInProgress.value = false
    }
  }

  const removeExistingRecord = async (collectionIdentifier, documentIdentifier) => {
    try {
      databaseTransactionInProgress.value = true
      databaseOperationFailure.value = null
      await deleteDocument(collectionIdentifier, documentIdentifier)
      return true
    } catch (deletionError) {
      databaseOperationFailure.value = deletionError.message
      throw deletionError
    } finally {
      databaseTransactionInProgress.value = false
    }
  }

  const retrieveSingleRecord = async (collectionIdentifier, documentIdentifier) => {
    try {
      databaseTransactionInProgress.value = true
      databaseOperationFailure.value = null
      const retrievedDocument = await getDocument(collectionIdentifier, documentIdentifier)
      return retrievedDocument
    } catch (retrievalError) {
      databaseOperationFailure.value = retrievalError.message
      throw retrievalError
    } finally {
      databaseTransactionInProgress.value = false
    }
  }

  const retrieveMultipleRecords = async (collectionReference, queryFilters = []) => {
    try {
      databaseTransactionInProgress.value = true
      databaseOperationFailure.value = null
      const retrievedDocuments = await getDocuments(collectionReference, queryFilters)
      return retrievedDocuments
    } catch (retrievalError) {
      databaseOperationFailure.value = retrievalError.message
      throw retrievalError
    } finally {
      databaseTransactionInProgress.value = false
    }
  }

  return {
    loading: computed(() => databaseTransactionInProgress.value),
    error: computed(() => databaseOperationFailure.value),
    clearError: clearOperationFailures,
    create: insertNewRecord,
    update: updateExistingRecord,
    remove: removeExistingRecord,
    get: retrieveSingleRecord,
    getAll: retrieveMultipleRecords
  }
}

// Dynamic entity management factory
export const useDataEntity = (entityType, collectionReference) => {
  const databaseOps = useFirestore()
  const entityTypeName = entityType.charAt(0).toUpperCase() + entityType.slice(1)

  // Generate dynamic operation methods
  const entityMethods = {
    [`add${entityTypeName}`]: (data) => databaseOps.create(collectionReference, data),
    [`modify${entityTypeName}`]: (id, data) => databaseOps.update(entityType + 's', id, data),
    [`fetch${entityTypeName}`]: (id) => databaseOps.get(entityType + 's', id),
    [`remove${entityTypeName}`]: (id) => databaseOps.remove(entityType + 's', id),
    [`fetchAll${entityTypeName}s`]: (filters) => databaseOps.getAll(collectionReference, filters)
  }

  return { ...databaseOps, ...entityMethods }
}

// Entity-specific database operations
export const useUserManagement = () => useDataEntity('user', usersCollection)
export const useResourceManagement = () => useDataEntity('resource', resourcesCollection)
export const useAppointmentManagement = () => useDataEntity('appointment', appointmentsCollection)
export const useRatingManagement = () => useDataEntity('rating', ratingsCollection)

export const useTherapistProfiles = () => {
  const baseOperations = useDataEntity('counsellorProfile', counsellorProfilesCollection)

  // Specialized profile creation with custom logic
  const establishProfile = async (profileInfo) => {
    try {
      baseOperations.loading.value = true
      baseOperations.error.value = null

      const { userId, ...profileDetails } = profileInfo
      const profileRef = doc(db, COLLECTIONS.COUNSELLOR_PROFILES, userId)

      await setDoc(profileRef, {
        ...profileDetails,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return userId
    } catch (err) {
      baseOperations.error.value = err.message
      throw err
    } finally {
      baseOperations.loading.value = false
    }
  }

  return { ...baseOperations, createProfile: establishProfile }
}

// Counsellor profiles management composable
export const useCounsellorProfiles = () => {
  const loading = ref(false)
  const error = ref(null)

  const getProfile = async (userId) => {
    try {
      loading.value = true
      error.value = null

      const profile = await getDocument(COLLECTIONS.COUNSELLOR_PROFILES, userId)
      return profile
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userId, profileData) => {
    try {
      loading.value = true
      error.value = null

      await updateDocument(COLLECTIONS.COUNSELLOR_PROFILES, userId, {
        ...profileData,
        updatedAt: new Date()
      })

      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null

      const profileId = await createDocument(counsellorProfilesCollection, {
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return profileId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProfile = async (userId) => {
    try {
      loading.value = true
      error.value = null

      await deleteDocument(COLLECTIONS.COUNSELLOR_PROFILES, userId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAllProfiles = async (filters = []) => {
    try {
      loading.value = true
      error.value = null

      const profiles = await getDocuments(counsellorProfilesCollection, filters)
      return profiles
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getProfile,
    createProfile,
    getAllProfiles,
    updateProfile,
    deleteProfile
  }
}

// Appointments management composable
export const useAppointments = () => {
  const loading = ref(false)
  const error = ref(null)

  const getAllAppointments = async (filters = []) => {
    try {
      loading.value = true
      error.value = null

      const appointments = await getDocuments(appointmentsCollection, filters)
      return appointments
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAppointment = async (appointmentId) => {
    try {
      loading.value = true
      error.value = null

      const appointment = await getDocument(COLLECTIONS.APPOINTMENTS, appointmentId)
      return appointment
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAppointment = async (appointmentId, appointmentData) => {
    try {
      loading.value = true
      error.value = null

      await updateDocument(COLLECTIONS.APPOINTMENTS, appointmentId, {
        ...appointmentData,
        updatedAt: new Date()
      })

      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAppointment = async (appointmentData) => {
    try {
      loading.value = true
      error.value = null

      const appointmentId = await createDocument(appointmentsCollection, {
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return appointmentId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDocument = async (appointmentId) => {
    // Alias for getAppointment to match component usage
    return await getAppointment(appointmentId)
  }

  return {
    loading,
    error,
    getAllAppointments,
    getAppointment,
    getDocument, // Alias for compatibility
    updateAppointment,
    createAppointment
  }
}

// Ratings management composable
export const useRatings = () => {
  const loading = ref(false)
  const error = ref(null)

  const getAllRatings = async (filters = []) => {
    try {
      loading.value = true
      error.value = null

      const ratings = await getDocuments(ratingsCollection, filters)
      return ratings
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRating = async (ratingId) => {
    try {
      loading.value = true
      error.value = null

      const rating = await getDocument(COLLECTIONS.RATINGS, ratingId)
      return rating
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRating = async (ratingData) => {
    try {
      loading.value = true
      error.value = null

      const ratingId = await createDocument(ratingsCollection, {
        ...ratingData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return ratingId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRating = async (ratingId, ratingData) => {
    try {
      loading.value = true
      error.value = null

      await updateDocument(COLLECTIONS.RATINGS, ratingId, {
        ...ratingData,
        updatedAt: new Date()
      })

      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getAllRatings,
    getRating,
    createRating,
    updateRating
  }
}

// Resources management composable
export const useResources = () => {
  const loading = ref(false)
  const error = ref(null)

  const getAllResources = async (filters = []) => {
    try {
      loading.value = true
      error.value = null

      const resources = await getDocuments(resourcesCollection, filters)
      return resources
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getResource = async (resourceId) => {
    try {
      loading.value = true
      error.value = null

      const resource = await getDocument(COLLECTIONS.RESOURCES, resourceId)
      return resource
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createResource = async (resourceData) => {
    try {
      loading.value = true
      error.value = null

      const resourceId = await createDocument(resourcesCollection, {
        ...resourceData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return resourceId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateResource = async (resourceId, resourceData) => {
    try {
      loading.value = true
      error.value = null

      await updateDocument(COLLECTIONS.RESOURCES, resourceId, {
        ...resourceData,
        updatedAt: new Date()
      })

      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getAllResources,
    getResource,
    createResource,
    updateResource
  }
}
