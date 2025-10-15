<template>
  <div class="debug-user-info">
    <div class="card">
      <div class="card-content">
        <span class="card-title">🔍 Debug: User Information</span>
        
        <div class="row">
          <div class="col s12">
            <h6>Authentication State:</h6>
            <p><strong>Is Authenticated:</strong> {{ isAuthenticated }}</p>
            <p><strong>Loading:</strong> {{ loading }}</p>
          </div>
        </div>
        
        <div class="row" v-if="user">
          <div class="col s12">
            <h6>User Object:</h6>
            <pre class="code-block">{{ JSON.stringify(user, null, 2) }}</pre>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12">
            <h6>Role Detection:</h6>
            <p><strong>User Role:</strong> {{ userRole || 'No role detected' }}</p>
            <p><strong>Is Youth User:</strong> {{ isYouthUser }}</p>
            <p><strong>Is Counsellor:</strong> {{ isCounsellor }}</p>
            <p><strong>Is Admin:</strong> {{ isAdmin }}</p>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12">
            <h6>Actions:</h6>
            <button class="btn blue" @click="refreshUserData" :disabled="loading">
              <i class="material-icons left">refresh</i>
              Refresh User Data
            </button>
            <button class="btn orange" @click="checkFirestoreUser" :disabled="loading">
              <i class="material-icons left">storage</i>
              Check Firestore
            </button>
            <button class="btn green" @click="fixUserRole" :disabled="loading">
              <i class="material-icons left">build</i>
              Fix Role (Set as Youth)
            </button>
          </div>
        </div>
        
        <div class="row" v-if="firestoreData">
          <div class="col s12">
            <h6>Firestore User Document:</h6>
            <pre class="code-block">{{ JSON.stringify(firestoreData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const { user, isAuthenticated, loading, userRole, isYouthUser, isCounsellor, isAdmin, getUserData } = useAuth()

const firestoreData = ref(null)

const refreshUserData = async () => {
  if (user.value?.uid) {
    console.log('Refreshing user data for:', user.value.uid)
    try {
      const userData = await getUserData(user.value.uid)
      console.log('Fresh user data from Firestore:', userData)
      
      // Update the user object
      user.value = {
        ...user.value,
        ...userData
      }
      
      console.log('Updated user object:', user.value)
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }
}

const checkFirestoreUser = async () => {
  if (user.value?.uid) {
    console.log('Checking Firestore document for:', user.value.uid)
    try {
      const userDoc = await getDoc(doc(db, 'users', user.value.uid))
      if (userDoc.exists()) {
        firestoreData.value = userDoc.data()
        console.log('Firestore document data:', firestoreData.value)
      } else {
        firestoreData.value = { error: 'No document found in Firestore' }
        console.log('No Firestore document found for user')
      }
    } catch (error) {
      console.error('Error checking Firestore:', error)
      firestoreData.value = { error: error.message }
    }
  }
}

const fixUserRole = async () => {
  if (user.value?.uid) {
    console.log('Fixing user role for:', user.value.uid)
    try {
      const userDocRef = doc(db, 'users', user.value.uid)

      // Check if document exists first
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          role: 'youth',
          updatedAt: new Date()
        })
        console.log('Updated existing user document with role: youth')
      } else {
        // Create new document if it doesn't exist
        await setDoc(userDocRef, {
          uid: user.value.uid,
          email: user.value.email,
          displayName: user.value.displayName,
          role: 'youth',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log('Created new user document with role: youth')
      }

      // Refresh user data
      await refreshUserData()

      alert('User role fixed! You should now be recognized as a youth user.')

    } catch (error) {
      console.error('Error fixing user role:', error)
      alert('Error fixing user role: ' + error.message)
    }
  }
}
</script>

<style scoped>
.debug-user-info {
  margin: 1rem 0;
}

.code-block {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  border: 1px solid #ddd;
}

.btn {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
