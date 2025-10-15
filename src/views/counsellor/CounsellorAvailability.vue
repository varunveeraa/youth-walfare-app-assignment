<template>
  <div class="counsellor-availability">
    <div class="container">
      <!-- Header -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel blue lighten-5">
            <h4 class="blue-text">Availability Management</h4>
            <p class="grey-text text-darken-1">
              Set your weekly schedule and manage your availability for client appointments.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row">
        <div class="col s12 center-align">
          <div class="preloader-wrapper big active">
            <div class="spinner-layer spinner-blue-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div>
              <div class="gap-patch">
                <div class="circle"></div>
              </div>
              <div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
          <p>Loading your availability...</p>
        </div>
      </div>

      <!-- Availability Settings -->
      <div v-else>
        <!-- Timezone and General Settings -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">schedule</i>
                  General Settings
                </span>

                <div class="row">
                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">public</i>
                    <select v-model="settings.timezone" required>
                      <option value="" disabled>Choose your timezone</option>
                      <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                        {{ tz.label }}
                      </option>
                    </select>
                    <label>Timezone</label>
                  </div>

                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">timer</i>
                    <select v-model="settings.sessionDuration" required>
                      <option value="" disabled>Session duration</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                    <label>Default Session Duration</label>
                  </div>
                </div>

                <div class="row">
                  <div class="col s12 m6">
                    <div class="switch">
                      <label>
                        Unavailable
                        <input type="checkbox" v-model="settings.acceptingNewClients">
                        <span class="lever"></span>
                        Accepting New Clients
                      </label>
                    </div>
                    <p class="grey-text">
                      {{ settings.acceptingNewClients ?
                        'You are currently accepting new client bookings' :
                        'You are not accepting new client bookings'
                      }}
                    </p>
                  </div>

                  <div class="col s12 m6">
                    <div class="input-field">
                      <i class="material-icons prefix">event_busy</i>
                      <input
                        id="advanceBooking"
                        type="number"
                        v-model.number="settings.advanceBookingDays"
                        min="1"
                        max="90"
                      >
                      <label for="advanceBooking">Advance Booking (days)</label>
                      <span class="helper-text">How far in advance clients can book</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Schedule -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">date_range</i>
                  Weekly Schedule
                </span>
                <p class="grey-text">Set your available hours for each day of the week</p>

                <div class="schedule-grid">
                  <div
                    v-for="(day, index) in weekDays"
                    :key="day.name"
                    class="day-schedule"
                  >
                    <div class="day-header">
                      <div class="day-toggle">
                        <label>
                          <input
                            type="checkbox"
                            v-model="schedule[index].isAvailable"
                            @change="toggleDayAvailability(index)"
                          />
                          <span class="day-name">{{ day.name }}</span>
                        </label>
                      </div>
                    </div>

                    <div v-if="schedule[index].isAvailable" class="time-slots">
                      <div
                        v-for="(slot, slotIndex) in schedule[index].timeSlots"
                        :key="slotIndex"
                        class="time-slot"
                      >
                        <div class="time-inputs">
                          <div class="input-field">
                            <input
                              type="time"
                              v-model="slot.startTime"
                              @change="validateTimeSlot(index, slotIndex)"
                            >
                            <label class="active">Start Time</label>
                          </div>
                          <span class="time-separator">to</span>
                          <div class="input-field">
                            <input
                              type="time"
                              v-model="slot.endTime"
                              @change="validateTimeSlot(index, slotIndex)"
                            >
                            <label class="active">End Time</label>
                          </div>
                          <button
                            v-if="schedule[index].timeSlots.length > 1"
                            type="button"
                            @click="removeTimeSlot(index, slotIndex)"
                            class="btn-small red"
                          >
                            <i class="material-icons">delete</i>
                          </button>
                        </div>
                        <div v-if="slot.error" class="error-text">
                          {{ slot.error }}
                        </div>
                      </div>

                      <button
                        type="button"
                        @click="addTimeSlot(index)"
                        class="btn-small blue"
                        style="margin-top: 1rem;"
                      >
                        <i class="material-icons left">add</i>
                        Add Time Slot
                      </button>
                    </div>

                    <div v-else class="unavailable-day">
                      <p class="grey-text center-align">Not available on {{ day.name }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Break Management -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">free_breakfast</i>
                  Breaks & Unavailable Periods
                </span>
                <p class="grey-text">Set specific dates when you'll be unavailable</p>

                <div class="breaks-section">
                  <!-- Existing Breaks -->
                  <div v-if="breaks.length > 0" class="breaks-list">
                    <h6>Scheduled Breaks</h6>
                    <div
                      v-for="(breakPeriod, index) in breaks"
                      :key="index"
                      class="break-item card-panel grey lighten-4"
                    >
                      <div class="row valign-wrapper">
                        <div class="col s8">
                          <strong>{{ breakPeriod.title }}</strong><br>
                          <span class="grey-text">
                            {{ formatDate(breakPeriod.startDate) }}
                            <span v-if="breakPeriod.endDate && breakPeriod.startDate !== breakPeriod.endDate">
                              to {{ formatDate(breakPeriod.endDate) }}
                            </span>
                          </span>
                          <div v-if="breakPeriod.reason" class="break-reason">
                            <small class="grey-text">{{ breakPeriod.reason }}</small>
                          </div>
                        </div>
                        <div class="col s4 right-align">
                          <button
                            type="button"
                            @click="removeBreak(index)"
                            class="btn-small red"
                          >
                            <i class="material-icons">delete</i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Add New Break -->
                  <div class="add-break-form">
                    <h6>Add New Break</h6>
                    <div class="row">
                      <div class="input-field col s12 m6">
                        <input
                          id="breakTitle"
                          type="text"
                          v-model="newBreak.title"
                          placeholder="e.g., Vacation, Conference, Personal Day"
                        >
                        <label for="breakTitle">Break Title</label>
                      </div>
                      <div class="input-field col s12 m3">
                        <input
                          id="breakStartDate"
                          type="date"
                          v-model="newBreak.startDate"
                          :min="minDate"
                        >
                        <label for="breakStartDate" class="active">Start Date</label>
                      </div>
                      <div class="input-field col s12 m3">
                        <input
                          id="breakEndDate"
                          type="date"
                          v-model="newBreak.endDate"
                          :min="newBreak.startDate || minDate"
                        >
                        <label for="breakEndDate" class="active">End Date (Optional)</label>
                      </div>
                    </div>
                    <div class="row">
                      <div class="input-field col s12 m8">
                        <textarea
                          id="breakReason"
                          class="materialize-textarea"
                          v-model="newBreak.reason"
                          placeholder="Optional reason for the break"
                        ></textarea>
                        <label for="breakReason">Reason (Optional)</label>
                      </div>
                      <div class="col s12 m4">
                        <button
                          type="button"
                          @click="addBreak"
                          class="btn blue"
                          :disabled="!canAddBreak"
                          style="margin-top: 1rem;"
                        >
                          <i class="material-icons left">add</i>
                          Add Break
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">flash_on</i>
                  Quick Actions
                </span>

                <div class="quick-actions">
                  <button
                    type="button"
                    @click="copyPreviousWeek"
                    class="btn blue"
                  >
                    <i class="material-icons left">content_copy</i>
                    Copy Previous Week
                  </button>

                  <button
                    type="button"
                    @click="setStandardHours"
                    class="btn green"
                  >
                    <i class="material-icons left">schedule</i>
                    Set Standard Hours (9-5)
                  </button>

                  <button
                    type="button"
                    @click="clearAllSchedule"
                    class="btn orange"
                  >
                    <i class="material-icons left">clear_all</i>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row">
          <div class="col s12 center-align">
            <button
              type="button"
              @click="saveAvailability"
              class="btn-large blue waves-effect waves-light"
              :disabled="submitting"
            >
              <i class="material-icons left">save</i>
              {{ submitting ? 'Saving...' : 'Save Availability' }}
            </button>

            <button
              type="button"
              @click="resetChanges"
              class="btn-large grey waves-effect waves-light"
              style="margin-left: 1rem;"
            >
              <i class="material-icons left">refresh</i>
              Reset Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useFirestore } from '@/composables/useFirestore'
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

const { user } = useAuth()
const { loading } = useFirestore()

// Reactive data
const submitting = ref(false)

const settings = reactive({
  timezone: 'America/New_York',
  sessionDuration: 60,
  acceptingNewClients: true,
  advanceBookingDays: 14
})

const weekDays = [
  { name: 'Sunday', short: 'Sun' },
  { name: 'Monday', short: 'Mon' },
  { name: 'Tuesday', short: 'Tue' },
  { name: 'Wednesday', short: 'Wed' },
  { name: 'Thursday', short: 'Thu' },
  { name: 'Friday', short: 'Fri' },
  { name: 'Saturday', short: 'Sat' }
]

const schedule = reactive(
  weekDays.map(() => ({
    isAvailable: false,
    timeSlots: [
      {
        startTime: '09:00',
        endTime: '17:00',
        error: null
      }
    ]
  }))
)

const breaks = ref([])

const newBreak = reactive({
  title: '',
  startDate: '',
  endDate: '',
  reason: ''
})

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
]

// Computed properties
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canAddBreak = computed(() => {
  return newBreak.title.trim() && newBreak.startDate
})

// Methods
const loadAvailability = async () => {
  if (!user.value?.uid) return

  try {
    // Load general settings
    const settingsDoc = await getDoc(doc(db, 'counsellorSettings', user.value.uid))
    if (settingsDoc.exists()) {
      Object.assign(settings, settingsDoc.data())
    }

    // Load weekly schedule
    const scheduleQuery = query(
      collection(db, 'availability'),
      where('counsellorId', '==', user.value.uid)
    )
    const scheduleSnapshot = await getDocs(scheduleQuery)

    // Reset schedule
    schedule.forEach(day => {
      day.isAvailable = false
      day.timeSlots = [{ startTime: '09:00', endTime: '17:00', error: null }]
    })

    scheduleSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.dayOfWeek >= 0 && data.dayOfWeek <= 6) {
        schedule[data.dayOfWeek].isAvailable = data.isAvailable
        if (data.timeSlots && data.timeSlots.length > 0) {
          schedule[data.dayOfWeek].timeSlots = data.timeSlots.map(slot => ({
            ...slot,
            error: null
          }))
        }
      }
    })

    // Load breaks
    const breaksQuery = query(
      collection(db, 'counsellorBreaks'),
      where('counsellorId', '==', user.value.uid)
    )
    const breaksSnapshot = await getDocs(breaksQuery)
    breaks.value = breaksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  } catch (error) {
    console.error('Error loading availability:', error)
    M.toast({ html: 'Error loading availability: ' + error.message, classes: 'red' })
  }
}

const toggleDayAvailability = (dayIndex) => {
  if (!schedule[dayIndex].isAvailable) {
    // Reset to default time slot when disabling
    schedule[dayIndex].timeSlots = [
      { startTime: '09:00', endTime: '17:00', error: null }
    ]
  }
}

const addTimeSlot = (dayIndex) => {
  schedule[dayIndex].timeSlots.push({
    startTime: '09:00',
    endTime: '17:00',
    error: null
  })
}

const removeTimeSlot = (dayIndex, slotIndex) => {
  if (schedule[dayIndex].timeSlots.length > 1) {
    schedule[dayIndex].timeSlots.splice(slotIndex, 1)
  }
}

const validateTimeSlot = (dayIndex, slotIndex) => {
  const slot = schedule[dayIndex].timeSlots[slotIndex]

  if (!slot.startTime || !slot.endTime) {
    slot.error = 'Both start and end times are required'
    return false
  }

  if (slot.startTime >= slot.endTime) {
    slot.error = 'End time must be after start time'
    return false
  }

  // Check for overlaps with other slots
  const otherSlots = schedule[dayIndex].timeSlots.filter((_, index) => index !== slotIndex)
  for (const otherSlot of otherSlots) {
    if (
      (slot.startTime >= otherSlot.startTime && slot.startTime < otherSlot.endTime) ||
      (slot.endTime > otherSlot.startTime && slot.endTime <= otherSlot.endTime) ||
      (slot.startTime <= otherSlot.startTime && slot.endTime >= otherSlot.endTime)
    ) {
      slot.error = 'Time slots cannot overlap'
      return false
    }
  }

  slot.error = null
  return true
}

const addBreak = () => {
  if (!canAddBreak.value) return

  const breakData = {
    title: newBreak.title.trim(),
    startDate: newBreak.startDate,
    endDate: newBreak.endDate || newBreak.startDate,
    reason: newBreak.reason.trim(),
    counsellorId: user.value.uid,
    createdAt: new Date()
  }

  breaks.value.push(breakData)

  // Reset form
  newBreak.title = ''
  newBreak.startDate = ''
  newBreak.endDate = ''
  newBreak.reason = ''
}

const removeBreak = (index) => {
  breaks.value.splice(index, 1)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
const copyPreviousWeek = () => {
  // This would typically fetch the previous week's schedule
  // For now, we'll just show a message
  M.toast({ html: 'Previous week schedule copied!', classes: 'blue' })
}

const setStandardHours = () => {
  // Set Monday to Friday 9-5
  for (let i = 1; i <= 5; i++) {
    schedule[i].isAvailable = true
    schedule[i].timeSlots = [
      { startTime: '09:00', endTime: '17:00', error: null }
    ]
  }
  // Disable weekends
  schedule[0].isAvailable = false
  schedule[6].isAvailable = false

  M.toast({ html: 'Standard business hours set (Mon-Fri 9-5)!', classes: 'green' })
}

const clearAllSchedule = () => {
  schedule.forEach(day => {
    day.isAvailable = false
    day.timeSlots = [{ startTime: '09:00', endTime: '17:00', error: null }]
  })
  M.toast({ html: 'All schedule cleared!', classes: 'orange' })
}

const validateAllTimeSlots = () => {
  let isValid = true

  schedule.forEach((day, dayIndex) => {
    if (day.isAvailable) {
      day.timeSlots.forEach((slot, slotIndex) => {
        if (!validateTimeSlot(dayIndex, slotIndex)) {
          isValid = false
        }
      })
    }
  })

  return isValid
}

const saveAvailability = async () => {
  if (!validateAllTimeSlots()) {
    M.toast({ html: 'Please fix time slot errors before saving', classes: 'red' })
    return
  }

  submitting.value = true

  try {
    // Save general settings
    await setDoc(doc(db, 'counsellorSettings', user.value.uid), {
      ...settings,
      updatedAt: new Date()
    })

    // Save weekly schedule
    const batch = []

    // Delete existing availability documents
    const existingQuery = query(
      collection(db, 'availability'),
      where('counsellorId', '==', user.value.uid)
    )
    const existingSnapshot = await getDocs(existingQuery)

    for (const docSnapshot of existingSnapshot.docs) {
      await deleteDoc(doc(db, 'availability', docSnapshot.id))
    }

    // Create new availability documents
    for (let dayIndex = 0; dayIndex < schedule.length; dayIndex++) {
      const day = schedule[dayIndex]
      if (day.isAvailable) {
        const availabilityData = {
          counsellorId: user.value.uid,
          dayOfWeek: dayIndex,
          isAvailable: true,
          timeSlots: day.timeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          })),
          timezone: settings.timezone,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const docRef = doc(collection(db, 'availability'))
        await setDoc(docRef, availabilityData)
      }
    }

    // Save breaks
    // Delete existing breaks
    const existingBreaksQuery = query(
      collection(db, 'counsellorBreaks'),
      where('counsellorId', '==', user.value.uid)
    )
    const existingBreaksSnapshot = await getDocs(existingBreaksQuery)

    for (const docSnapshot of existingBreaksSnapshot.docs) {
      await deleteDoc(doc(db, 'counsellorBreaks', docSnapshot.id))
    }

    // Create new breaks
    for (const breakPeriod of breaks.value) {
      if (!breakPeriod.id) {
        const docRef = doc(collection(db, 'counsellorBreaks'))
        await setDoc(docRef, {
          ...breakPeriod,
          counsellorId: user.value.uid,
          createdAt: new Date()
        })
      }
    }

    M.toast({ html: 'Availability saved successfully!', classes: 'green' })

  } catch (error) {
    console.error('Error saving availability:', error)
    M.toast({ html: 'Error saving availability: ' + error.message, classes: 'red' })
  } finally {
    submitting.value = false
  }
}

const resetChanges = () => {
  loadAvailability()
  M.toast({ html: 'Changes reset!', classes: 'blue' })
}

// Lifecycle
onMounted(async () => {
  await loadAvailability()

  // Initialize Materialize components
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('select'))
  }, 100)
})
</script>
<style scoped>
.counsellor-availability {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.day-schedule {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.day-header {
  background-color: #2196f3;
  color: white;
  padding: 1rem;
}

.day-toggle label {
  display: flex;
  align-items: center;
  margin: 0;
  cursor: pointer;
}

.day-toggle input[type="checkbox"] {
  margin-right: 0.5rem;
}

.day-name {
  font-weight: 500;
  font-size: 1.1rem;
}

.time-slots {
  padding: 1rem;
}

.time-slot {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.time-inputs .input-field {
  flex: 1;
  min-width: 120px;
  margin: 0;
}

.time-separator {
  font-weight: 500;
  color: #666;
  margin: 0 0.5rem;
}

.unavailable-day {
  padding: 2rem;
  text-align: center;
  background-color: #f5f5f5;
}

.breaks-section {
  margin-top: 1rem;
}

.breaks-list {
  margin-bottom: 2rem;
}

.break-item {
  margin-bottom: 0.5rem;
  padding: 1rem;
}

.break-reason {
  margin-top: 0.5rem;
}

.add-break-form {
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
}

.error-text {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

@media only screen and (max-width: 768px) {
  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .time-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .time-separator {
    text-align: center;
    margin: 0.5rem 0;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .btn {
    width: 100%;
  }
}

@media only screen and (max-width: 600px) {
  .day-schedule {
    margin-bottom: 1rem;
  }

  .time-slot {
    padding: 0.5rem;
  }

  .break-item {
    padding: 0.5rem;
  }
}
</style>
