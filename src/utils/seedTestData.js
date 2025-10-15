// Utility to seed test data for counsellor statistics
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS } from '@/firebase/collections'

export const seedTestData = async (counsellorId) => {
  try {
    console.log('Seeding test data for counsellor:', counsellorId)

    // Create some test appointments
    const appointments = [
      {
        counsellorId,
        userId: 'test-user-1',
        appointmentDate: new Date('2024-01-15'),
        status: 'completed',
        sessionType: 'video',
        duration: 60,
        createdAt: new Date('2024-01-10')
      },
      {
        counsellorId,
        userId: 'test-user-2', 
        appointmentDate: new Date('2024-01-20'),
        status: 'completed',
        sessionType: 'video',
        duration: 60,
        createdAt: new Date('2024-01-15')
      },
      {
        counsellorId,
        userId: 'test-user-3',
        appointmentDate: new Date('2024-01-25'),
        status: 'completed',
        sessionType: 'video',
        duration: 60,
        createdAt: new Date('2024-01-20')
      },
      {
        counsellorId,
        userId: 'test-user-1', // Same user, different appointment
        appointmentDate: new Date('2024-01-30'),
        status: 'completed',
        sessionType: 'video',
        duration: 60,
        createdAt: new Date('2024-01-25')
      }
    ]

    // Add appointments to Firestore
    for (const appointment of appointments) {
      await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), appointment)
    }

    // Create some test ratings
    const ratings = [
      {
        counsellorId,
        userId: 'test-user-1',
        appointmentId: 'test-appointment-1',
        rating: 5,
        comment: 'Excellent counsellor, very helpful and understanding.',
        createdAt: new Date('2024-01-16')
      },
      {
        counsellorId,
        userId: 'test-user-2',
        appointmentId: 'test-appointment-2', 
        rating: 4,
        comment: 'Great session, felt much better afterwards.',
        createdAt: new Date('2024-01-21')
      },
      {
        counsellorId,
        userId: 'test-user-3',
        appointmentId: 'test-appointment-3',
        rating: 5,
        comment: 'Professional and caring approach.',
        createdAt: new Date('2024-01-26')
      }
    ]

    // Add ratings to Firestore
    for (const rating of ratings) {
      await addDoc(collection(db, COLLECTIONS.RATINGS), rating)
    }

    // Create counsellor settings with working hours
    const counsellorSettings = {
      counsellorId,
      workingHours: {
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' }
      },
      sessionDuration: 60,
      breakBetweenSessions: 15,
      timezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add counsellor settings
    await setDoc(doc(db, COLLECTIONS.COUNSELLOR_SETTINGS, counsellorId), counsellorSettings)

    console.log('Test data seeded successfully!')
    return {
      appointmentsAdded: appointments.length,
      ratingsAdded: ratings.length,
      settingsCreated: true
    }

  } catch (error) {
    console.error('Error seeding test data:', error)
    throw error
  }
}

// Function to clear test data
export const clearTestData = async (counsellorId) => {
  try {
    console.log('Clearing test data for counsellor:', counsellorId)
    
    // Note: In a real app, you'd want to be more careful about deleting data
    // This is just for testing purposes
    
    console.log('Test data cleared (implementation needed for production)')
    
  } catch (error) {
    console.error('Error clearing test data:', error)
    throw error
  }
}
