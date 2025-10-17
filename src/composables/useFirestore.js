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
  const loading = ref(false)
  const error = ref(null)

  const clearError = () => {
    error.value = null
  }

  // Generic operations
  const create = async (collectionRef, data) => {
    try {
      loading.value = true
      error.value = null
      const id = await createDocument(collectionRef, data)
      return id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (collectionName, docId, data) => {
    try {
      loading.value = true
      error.value = null
      await updateDocument(collectionName, docId, data)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const remove = async (collectionName, docId) => {
    try {
      loading.value = true
      error.value = null
      await deleteDocument(collectionName, docId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = async (collectionName, docId) => {
    try {
      loading.value = true
      error.value = null
      const doc = await getDocument(collectionName, docId)
      return doc
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAll = async (collectionRef, queryConstraints = []) => {
    try {
      loading.value = true
      error.value = null
      const docs = await getDocuments(collectionRef, queryConstraints)
      return docs
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    clearError,
    create,
    update,
    remove,
    get,
    getAll
  }
}

// Generic CRUD composable factory
export const useEntity = (entityName, collectionRef) => {
  const firestore = useFirestore()
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1)

  // Create dynamic method names
  const methods = {
    [`create${capitalizedEntity}`]: (data) => firestore.create(collectionRef, data),
    [`update${capitalizedEntity}`]: (id, data) => firestore.update(entityName + 's', id, data),
    [`get${capitalizedEntity}`]: (id) => firestore.get(entityName + 's', id),
    [`delete${capitalizedEntity}`]: (id) => firestore.remove(entityName + 's', id),
    [`getAll${capitalizedEntity}s`]: (queryConstraints) => firestore.getAll(collectionRef, queryConstraints)
  }

  return { ...firestore, ...methods }
}

// Specific composables using the factory
export const useUsers = () => useEntity('user', usersCollection)
export const useResources = () => useEntity('resource', resourcesCollection)
export const useAppointments = () => useEntity('appointment', appointmentsCollection)
export const useRatings = () => useEntity('rating', ratingsCollection)

export const useCounsellorProfiles = () => {
  const baseEntity = useEntity('counsellorProfile', counsellorProfilesCollection)

  // Override create method for custom userId logic
  const createProfile = async (profileData) => {
    try {
      baseEntity.loading.value = true
      baseEntity.error.value = null

      const { userId, ...data } = profileData
      const docRef = doc(db, COLLECTIONS.COUNSELLOR_PROFILES, userId)

      await setDoc(docRef, {
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return userId
    } catch (err) {
      baseEntity.error.value = err.message
      throw err
    } finally {
      baseEntity.loading.value = false
    }
  }

  return { ...baseEntity, createProfile }
}
