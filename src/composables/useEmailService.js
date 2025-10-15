import { ref } from 'vue'
import emailService from '@/services/emailService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS } from '@/firebase/collections'

export const useEmailService = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Send welcome email after user registration
   */
  const sendWelcomeEmail = async (user, userRole) => {
    loading.value = true
    error.value = null

    try {
      console.log('Sending welcome email to:', user.email)
      
      const result = await emailService.sendWelcomeEmail(
        user.email,
        user.displayName || user.email.split('@')[0],
        userRole
      )

      if (result.success) {
        console.log('Welcome email sent successfully')
        return { success: true, message: 'Welcome email sent' }
      } else {
        throw new Error(result.message)
      }

    } catch (err) {
      console.error('Error sending welcome email:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Send appointment confirmation email
   */
  const sendAppointmentConfirmation = async (appointmentId, appointment) => {
    loading.value = true
    error.value = null

    try {
      console.log('Sending appointment confirmation for:', appointmentId)

      // Get counsellor information
      const counsellorDoc = await getDoc(doc(db, COLLECTIONS.COUNSELLOR_PROFILES, appointment.counsellorId))
      if (!counsellorDoc.exists()) {
        throw new Error('Counsellor not found')
      }
      const counsellorInfo = counsellorDoc.data()

      // Get user information
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, appointment.userId))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const userInfo = userDoc.data()

      const result = await emailService.sendAppointmentConfirmation(
        appointment,
        {
          name: counsellorInfo.name,
          email: counsellorInfo.email,
          address: counsellorInfo.address
        },
        {
          displayName: userInfo.displayName,
          email: userInfo.email
        }
      )

      if (result.success) {
        console.log('Appointment confirmation sent successfully')
        return { success: true, message: 'Appointment confirmation sent' }
      } else {
        throw new Error(result.message)
      }

    } catch (err) {
      console.error('Error sending appointment confirmation:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Send appointment reminder email
   */
  const sendAppointmentReminder = async (appointmentId, appointment) => {
    loading.value = true
    error.value = null

    try {
      console.log('Sending appointment reminder for:', appointmentId)

      // Get counsellor information
      const counsellorDoc = await getDoc(doc(db, COLLECTIONS.COUNSELLOR_PROFILES, appointment.counsellorId))
      if (!counsellorDoc.exists()) {
        throw new Error('Counsellor not found')
      }
      const counsellorInfo = counsellorDoc.data()

      // Get user information
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, appointment.userId))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const userInfo = userDoc.data()

      const result = await emailService.sendAppointmentReminder(
        appointment,
        {
          name: counsellorInfo.name,
          email: counsellorInfo.email
        },
        {
          displayName: userInfo.displayName,
          email: userInfo.email
        }
      )

      if (result.success) {
        console.log('Appointment reminder sent successfully')
        return { success: true, message: 'Appointment reminder sent' }
      } else {
        throw new Error(result.message)
      }

    } catch (err) {
      console.error('Error sending appointment reminder:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Test email functionality
   */
  const testEmailService = async (testEmail = 'test@example.com') => {
    loading.value = true
    error.value = null

    try {
      console.log('Testing email service with:', testEmail)

      const result = await emailService.sendWelcomeEmail(
        testEmail,
        'Test User',
        'youth'
      )

      if (result.success) {
        console.log('Test email sent successfully')
        return { success: true, message: 'Test email sent successfully' }
      } else {
        throw new Error(result.message)
      }

    } catch (err) {
      console.error('Error testing email service:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Send bulk emails (for admin use)
   */
  const sendBulkEmails = async (emailList, emailType, customData = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log(`Sending bulk ${emailType} emails to ${emailList.length} recipients`)

      const results = []
      
      for (const emailData of emailList) {
        try {
          let result
          
          switch (emailType) {
            case 'welcome':
              result = await emailService.sendWelcomeEmail(
                emailData.email,
                emailData.name,
                emailData.role
              )
              break
            case 'reminder':
              result = await emailService.sendAppointmentReminder(
                emailData.appointment,
                emailData.counsellorInfo,
                emailData.userInfo
              )
              break
            default:
              throw new Error(`Unknown email type: ${emailType}`)
          }

          results.push({
            email: emailData.email,
            success: result.success,
            message: result.message
          })

        } catch (err) {
          results.push({
            email: emailData.email,
            success: false,
            message: err.message
          })
        }

        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const successCount = results.filter(r => r.success).length
      const failureCount = results.length - successCount

      console.log(`Bulk email results: ${successCount} sent, ${failureCount} failed`)

      return {
        success: true,
        message: `Bulk emails completed: ${successCount} sent, ${failureCount} failed`,
        results
      }

    } catch (err) {
      console.error('Error sending bulk emails:', err)
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,

    // Methods
    sendWelcomeEmail,
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    testEmailService,
    sendBulkEmails
  }
}
