// Firestore collection references and utilities
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './config'

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  RESOURCES: 'resources',
  APPOINTMENTS: 'appointments',
  RATINGS: 'ratings',
  COUNSELLOR_PROFILES: 'counsellorProfiles',
  AVAILABILITY: 'availability',
  COUNSELLOR_SETTINGS: 'counsellorSettings',
  COUNSELLOR_BREAKS: 'counsellorBreaks'
}

// Collection references
export const usersCollection = collection(db, COLLECTIONS.USERS)
export const resourcesCollection = collection(db, COLLECTIONS.RESOURCES)
export const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS)
export const ratingsCollection = collection(db, COLLECTIONS.RATINGS)
export const counsellorProfilesCollection = collection(db, COLLECTIONS.COUNSELLOR_PROFILES)
export const availabilityCollection = collection(db, COLLECTIONS.AVAILABILITY)
export const counsellorSettingsCollection = collection(db, COLLECTIONS.COUNSELLOR_SETTINGS)
export const counsellorBreaksCollection = collection(db, COLLECTIONS.COUNSELLOR_BREAKS)

// Generic CRUD operations
export const createDocument = async (collectionRef, data) => {
  try {
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    throw error
  }
}

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    throw error
  }
}

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

export const getDocuments = async (collectionRef, queryConstraints = []) => {
  try {
    const q = queryConstraints.length > 0 
      ? query(collectionRef, ...queryConstraints)
      : collectionRef
    
    const querySnapshot = await getDocs(q)
    const documents = []
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    
    return documents
  } catch (error) {
    throw error
  }
}

// Specific query helpers
export const getUsersByRole = async (role) => {
  return getDocuments(usersCollection, [where('role', '==', role)])
}

export const getCounsellorProfiles = async () => {
  return getDocuments(counsellorProfilesCollection, [
    where('isActive', '==', true),
    orderBy('averageRating', 'desc')
  ])
}



export const getUserAppointments = async (userId) => {
  return getDocuments(appointmentsCollection, [
    where('userId', '==', userId),
    orderBy('appointmentDate', 'desc')
  ])
}

export const getCounsellorAppointments = async (counsellorId) => {
  return getDocuments(appointmentsCollection, [
    where('counsellorId', '==', counsellorId),
    orderBy('appointmentDate', 'desc')
  ])
}

export const getCounsellorRatings = async (counsellorId) => {
  return getDocuments(ratingsCollection, [
    where('counsellorId', '==', counsellorId),
    orderBy('createdAt', 'desc')
  ])
}

export const getResourcesByCategory = async (category) => {
  return getDocuments(resourcesCollection, [
    where('category', '==', category),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  ])
}
