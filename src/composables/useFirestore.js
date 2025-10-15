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
  forumPostsCollection,
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

// Specific composables for different entities
export const useUsers = () => {
  const firestore = useFirestore()

  const createUser = (userData) => firestore.create(usersCollection, userData)
  const updateUser = (userId, userData) => firestore.update(COLLECTIONS.USERS, userId, userData)
  const getUser = (userId) => firestore.get(COLLECTIONS.USERS, userId)
  const deleteUser = (userId) => firestore.remove(COLLECTIONS.USERS, userId)

  return {
    ...firestore,
    createUser,
    updateUser,
    getUser,
    deleteUser
  }
}

export const useResources = () => {
  const firestore = useFirestore()

  const createResource = (resourceData) => firestore.create(resourcesCollection, resourceData)
  const updateResource = (resourceId, resourceData) => firestore.update(COLLECTIONS.RESOURCES, resourceId, resourceData)
  const getResource = (resourceId) => firestore.get(COLLECTIONS.RESOURCES, resourceId)
  const deleteResource = (resourceId) => firestore.remove(COLLECTIONS.RESOURCES, resourceId)
  const getAllResources = (queryConstraints) => firestore.getAll(resourcesCollection, queryConstraints)

  return {
    ...firestore,
    createResource,
    updateResource,
    getResource,
    deleteResource,
    getAllResources
  }
}

export const useForumPosts = () => {
  const firestore = useFirestore()

  const createPost = (postData) => firestore.create(forumPostsCollection, postData)
  const updatePost = (postId, postData) => firestore.update(COLLECTIONS.FORUM_POSTS, postId, postData)
  const getPost = (postId) => firestore.get(COLLECTIONS.FORUM_POSTS, postId)
  const deletePost = (postId) => firestore.remove(COLLECTIONS.FORUM_POSTS, postId)
  const getAllPosts = (queryConstraints) => firestore.getAll(forumPostsCollection, queryConstraints)

  return {
    ...firestore,
    createPost,
    updatePost,
    getPost,
    deletePost,
    getAllPosts
  }
}

export const useAppointments = () => {
  const firestore = useFirestore()

  const createAppointment = (appointmentData) => firestore.create(appointmentsCollection, appointmentData)
  const updateAppointment = (appointmentId, appointmentData) => firestore.update(COLLECTIONS.APPOINTMENTS, appointmentId, appointmentData)
  const getAppointment = (appointmentId) => firestore.get(COLLECTIONS.APPOINTMENTS, appointmentId)
  const deleteAppointment = (appointmentId) => firestore.remove(COLLECTIONS.APPOINTMENTS, appointmentId)
  const getAllAppointments = (queryConstraints) => firestore.getAll(appointmentsCollection, queryConstraints)

  return {
    ...firestore,
    createAppointment,
    updateAppointment,
    getAppointment,
    deleteAppointment,
    getAllAppointments
  }
}

export const useRatings = () => {
  const firestore = useFirestore()

  const createRating = (ratingData) => firestore.create(ratingsCollection, ratingData)
  const updateRating = (ratingId, ratingData) => firestore.update(COLLECTIONS.RATINGS, ratingId, ratingData)
  const getRating = (ratingId) => firestore.get(COLLECTIONS.RATINGS, ratingId)
  const deleteRating = (ratingId) => firestore.remove(COLLECTIONS.RATINGS, ratingId)
  const getAllRatings = (queryConstraints) => firestore.getAll(ratingsCollection, queryConstraints)

  return {
    ...firestore,
    createRating,
    updateRating,
    getRating,
    deleteRating,
    getAllRatings
  }
}

export const useCounsellorProfiles = () => {
  const firestore = useFirestore()

  // Custom create function that uses userId as document ID
  const createProfile = async (profileData) => {
    try {
      firestore.loading.value = true
      firestore.error.value = null

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
      firestore.error.value = err.message
      throw err
    } finally {
      firestore.loading.value = false
    }
  }

  const updateProfile = (profileId, profileData) => firestore.update(COLLECTIONS.COUNSELLOR_PROFILES, profileId, profileData)
  const getProfile = (profileId) => firestore.get(COLLECTIONS.COUNSELLOR_PROFILES, profileId)
  const deleteProfile = (profileId) => firestore.remove(COLLECTIONS.COUNSELLOR_PROFILES, profileId)
  const getAllProfiles = (queryConstraints) => firestore.getAll(counsellorProfilesCollection, queryConstraints)

  return {
    ...firestore,
    createProfile,
    updateProfile,
    getProfile,
    deleteProfile,
    getAllProfiles
  }
}
