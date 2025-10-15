<template>
  <div class="counsellor-profile">
    <div class="container">
      <!-- Header -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel blue lighten-5">
            <h4 class="blue-text">Professional Profile</h4>
            <p class="grey-text text-darken-1">
              Manage your professional information, credentials, and service details.
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
          <p>Loading your profile...</p>
        </div>
      </div>

      <!-- Profile Form -->
      <form v-else @submit.prevent="saveProfile" class="profile-form">
        <!-- Basic Information -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">person</i>
                  Basic Information
                </span>

                <div class="row">
                  <!-- Profile Picture -->
                  <div class="col s12 m4 center-align">
                    <div class="profile-picture-section">
                      <img
                        :src="profile.profilePicture || '/api/placeholder/200/200'"
                        alt="Profile Picture"
                        class="circle responsive-img profile-pic"
                      >
                      <div class="file-field input-field">
                        <div class="btn blue">
                          <span>Upload Photo</span>
                          <input type="file" @change="handleImageUpload" accept="image/*">
                        </div>
                        <div class="file-path-wrapper">
                          <input class="file-path validate" type="text" placeholder="Profile picture">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Basic Details -->
                  <div class="col s12 m8">
                    <div class="row">
                      <div class="input-field col s12 m6">
                        <i class="material-icons prefix">account_circle</i>
                        <input
                          id="displayName"
                          type="text"
                          v-model="profile.displayName"
                          :class="{ invalid: errors.displayName }"
                          required
                        >
                        <label for="displayName">Full Name</label>
                        <span v-if="errors.displayName" class="helper-text error-text">
                          {{ errors.displayName }}
                        </span>
                      </div>

                      <div class="input-field col s12 m6">
                        <i class="material-icons prefix">email</i>
                        <input
                          id="email"
                          type="email"
                          v-model="profile.email"
                          :class="{ invalid: errors.email }"
                          required
                        >
                        <label for="email">Email Address</label>
                        <span v-if="errors.email" class="helper-text error-text">
                          {{ errors.email }}
                        </span>
                      </div>

                      <div class="input-field col s12">
                        <i class="material-icons prefix">description</i>
                        <textarea
                          id="bio"
                          class="materialize-textarea"
                          v-model="profile.bio"
                          :class="{ invalid: errors.bio }"
                          maxlength="500"
                        ></textarea>
                        <label for="bio">Professional Bio</label>
                        <span class="helper-text">
                          {{ profile.bio.length }}/500 characters
                        </span>
                        <span v-if="errors.bio" class="helper-text error-text">
                          {{ errors.bio }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Credentials -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">verified_user</i>
                  Professional Credentials
                </span>

                <div class="row">
                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">badge</i>
                    <input
                      id="licenseNumber"
                      type="text"
                      v-model="profile.licenseNumber"
                      :class="{ invalid: errors.licenseNumber }"
                      required
                    >
                    <label for="licenseNumber">License Number</label>
                    <span v-if="errors.licenseNumber" class="helper-text error-text">
                      {{ errors.licenseNumber }}
                    </span>
                  </div>

                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">location_on</i>
                    <select v-model="profile.licenseState" :class="{ invalid: errors.licenseState }" required>
                      <option value="" disabled>Choose your state</option>
                      <option v-for="state in states" :key="state.code" :value="state.code">
                        {{ state.name }}
                      </option>
                    </select>
                    <label>License State</label>
                    <span v-if="errors.licenseState" class="helper-text error-text">
                      {{ errors.licenseState }}
                    </span>
                  </div>

                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">work</i>
                    <input
                      id="experience"
                      type="number"
                      v-model.number="profile.experience"
                      :class="{ invalid: errors.experience }"
                      min="0"
                      max="50"
                      required
                    >
                    <label for="experience">Years of Experience</label>
                    <span v-if="errors.experience" class="helper-text error-text">
                      {{ errors.experience }}
                    </span>
                  </div>

                  <div class="input-field col s12 m6">
                    <i class="material-icons prefix">attach_money</i>
                    <input
                      id="hourlyRate"
                      type="number"
                      v-model.number="profile.hourlyRate"
                      :class="{ invalid: errors.hourlyRate }"
                      min="50"
                      max="500"
                      step="5"
                      required
                    >
                    <label for="hourlyRate">Hourly Rate ($)</label>
                    <span v-if="errors.hourlyRate" class="helper-text error-text">
                      {{ errors.hourlyRate }}
                    </span>
                  </div>
                </div>

                <!-- Qualifications -->
                <div class="row">
                  <div class="col s12">
                    <h6>Qualifications & Certifications</h6>
                    <div class="qualification-list">
                      <div
                        v-for="(qualification, index) in profile.qualifications"
                        :key="index"
                        class="qualification-item card-panel grey lighten-4"
                      >
                        <div class="row valign-wrapper">
                          <div class="col s10">
                            <strong>{{ qualification.title }}</strong><br>
                            <span class="grey-text">{{ qualification.institution }} ({{ qualification.year }})</span>
                          </div>
                          <div class="col s2 right-align">
                            <button
                              type="button"
                              @click="removeQualification(index)"
                              class="btn-small red"
                            >
                              <i class="material-icons">delete</i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Add Qualification Form -->
                    <div class="add-qualification-form">
                      <div class="row">
                        <div class="input-field col s12 m4">
                          <input
                            id="qualTitle"
                            type="text"
                            v-model="newQualification.title"
                            placeholder="e.g., Master's in Psychology"
                          >
                          <label for="qualTitle">Qualification Title</label>
                        </div>
                        <div class="input-field col s12 m4">
                          <input
                            id="qualInstitution"
                            type="text"
                            v-model="newQualification.institution"
                            placeholder="e.g., University of California"
                          >
                          <label for="qualInstitution">Institution</label>
                        </div>
                        <div class="input-field col s12 m2">
                          <input
                            id="qualYear"
                            type="number"
                            v-model.number="newQualification.year"
                            :min="1950"
                            :max="new Date().getFullYear()"
                            placeholder="2020"
                          >
                          <label for="qualYear">Year</label>
                        </div>
                        <div class="col s12 m2">
                          <button
                            type="button"
                            @click="addQualification"
                            class="btn blue"
                            :disabled="!canAddQualification"
                          >
                            <i class="material-icons">add</i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specializations & Services -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">psychology</i>
                  Specializations & Services
                </span>

                <!-- Specializations -->
                <div class="row">
                  <div class="col s12">
                    <h6>Areas of Specialization</h6>
                    <p class="grey-text">Select the areas you specialize in (choose at least 2)</p>

                    <div class="specialization-chips">
                      <div
                        v-for="specialization in availableSpecializations"
                        :key="specialization"
                        class="chip-container"
                      >
                        <label>
                          <input
                            type="checkbox"
                            :value="specialization"
                            v-model="profile.specializations"
                          />
                          <span class="chip-label">{{ specialization }}</span>
                        </label>
                      </div>
                    </div>
                    <span v-if="errors.specializations" class="helper-text error-text">
                      {{ errors.specializations }}
                    </span>
                  </div>
                </div>

                <!-- Session Types -->
                <div class="row">
                  <div class="col s12">
                    <h6>Session Types Offered</h6>
                    <p class="grey-text">Select the types of sessions you provide</p>

                    <div class="session-types">
                      <label>
                        <input
                          type="checkbox"
                          value="video"
                          v-model="profile.sessionTypes"
                        />
                        <span>
                          <i class="material-icons left">videocam</i>
                          Video Sessions
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          value="audio"
                          v-model="profile.sessionTypes"
                        />
                        <span>
                          <i class="material-icons left">phone</i>
                          Audio/Phone Sessions
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          value="chat"
                          v-model="profile.sessionTypes"
                        />
                        <span>
                          <i class="material-icons left">chat</i>
                          Text/Chat Sessions
                        </span>
                      </label>
                    </div>
                    <span v-if="errors.sessionTypes" class="helper-text error-text">
                      {{ errors.sessionTypes }}
                    </span>
                  </div>
                </div>

                <!-- Languages -->
                <div class="row">
                  <div class="col s12">
                    <h6>Languages Spoken</h6>
                    <div class="language-chips">
                      <div
                        v-for="language in availableLanguages"
                        :key="language"
                        class="chip-container"
                      >
                        <label>
                          <input
                            type="checkbox"
                            :value="language"
                            v-model="profile.languages"
                          />
                          <span class="chip-label">{{ language }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Status -->
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">toggle_on</i>
                  Profile Status
                </span>

                <div class="row">
                  <div class="col s12 m6">
                    <div class="switch">
                      <label>
                        Inactive
                        <input type="checkbox" v-model="profile.isActive">
                        <span class="lever"></span>
                        Active
                      </label>
                    </div>
                    <p class="grey-text">
                      {{ profile.isActive ? 'Your profile is visible to clients' : 'Your profile is hidden from clients' }}
                    </p>
                  </div>

                  <div class="col s12 m6">
                    <div class="verification-status">
                      <h6>Verification Status</h6>
                      <div class="chip" :class="profile.isVerified ? 'green white-text' : 'orange white-text'">
                        <i class="material-icons left">
                          {{ profile.isVerified ? 'verified' : 'pending' }}
                        </i>
                        {{ profile.isVerified ? 'Verified' : 'Pending Verification' }}
                      </div>
                      <p class="grey-text small">
                        {{ profile.isVerified ?
                          'Your credentials have been verified by our team.' :
                          'Your credentials are being reviewed by our team.'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row">
          <div class="col s12 center-align">
            <button
              type="submit"
              class="btn-large blue waves-effect waves-light"
              :disabled="submitting"
            >
              <i class="material-icons left">save</i>
              {{ submitting ? 'Saving...' : 'Save Profile' }}
            </button>

            <button
              type="button"
              @click="resetForm"
              class="btn-large grey waves-effect waves-light"
              style="margin-left: 1rem;"
            >
              <i class="material-icons left">refresh</i>
              Reset Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useCounsellorProfiles } from '@/composables/useFirestore'
import { validateRequired, validateEmail } from '@/utils/validation'
import { getDefaultCounsellorProfile } from '@/firebase/schema'

const { user } = useAuth()
const {
  getProfile,
  createProfile,
  updateProfile,
  loading,
  error
} = useCounsellorProfiles()

// Reactive data
const submitting = ref(false)
const profileExists = ref(false)

const profile = reactive({
  displayName: '',
  email: '',
  bio: '',
  licenseNumber: '',
  licenseState: '',
  experience: 0,
  hourlyRate: 100,
  specializations: [],
  qualifications: [],
  sessionTypes: ['video'],
  languages: ['English'],
  isActive: false,
  isVerified: false,
  profilePicture: ''
})

const newQualification = reactive({
  title: '',
  institution: '',
  year: new Date().getFullYear()
})

const errors = reactive({
  displayName: null,
  email: null,
  bio: null,
  licenseNumber: null,
  licenseState: null,
  experience: null,
  hourlyRate: null,
  specializations: null,
  sessionTypes: null
})

// Available options
const availableSpecializations = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Relationship Issues',
  'Addiction & Substance Abuse',
  'Eating Disorders',
  'ADHD',
  'Autism Spectrum',
  'Grief & Loss',
  'Family Therapy',
  'Couples Therapy',
  'Teen & Adolescent',
  'LGBTQ+ Issues',
  'Career Counseling',
  'Stress Management'
]

const availableLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian'
]

const states = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]
// Computed properties
const canAddQualification = computed(() => {
  return newQualification.title.trim() &&
         newQualification.institution.trim() &&
         newQualification.year
})

// Methods
const loadProfile = async () => {
  if (!user.value?.uid) return

  try {
    const existingProfile = await getProfile(user.value.uid)

    if (existingProfile) {
      profileExists.value = true
      Object.assign(profile, existingProfile)
    } else {
      // Initialize with default profile
      const defaultProfile = getDefaultCounsellorProfile(user.value)
      Object.assign(profile, defaultProfile)
      profileExists.value = false
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    // Initialize with default profile on error
    const defaultProfile = getDefaultCounsellorProfile(user.value)
    Object.assign(profile, defaultProfile)
    profileExists.value = false
  }
}

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = null
  })

  // Validate required fields
  errors.displayName = validateRequired(profile.displayName, 'Full name')
  errors.email = validateEmail(profile.email)
  errors.licenseNumber = validateRequired(profile.licenseNumber, 'License number')
  errors.licenseState = validateRequired(profile.licenseState, 'License state')

  if (profile.experience < 0 || profile.experience > 50) {
    errors.experience = 'Experience must be between 0 and 50 years'
  }

  if (profile.hourlyRate < 50 || profile.hourlyRate > 500) {
    errors.hourlyRate = 'Hourly rate must be between $50 and $500'
  }

  if (profile.specializations.length < 2) {
    errors.specializations = 'Please select at least 2 specializations'
  }

  if (profile.sessionTypes.length === 0) {
    errors.sessionTypes = 'Please select at least one session type'
  }

  if (profile.bio.length < 50) {
    errors.bio = 'Bio must be at least 50 characters long'
  }

  return !Object.values(errors).some(error => error !== null)
}

const saveProfile = async () => {
  if (!validateForm()) {
    M.toast({ html: 'Please fix the errors before saving', classes: 'red' })
    return
  }

  submitting.value = true

  try {
    const profileData = {
      ...profile,
      userId: user.value.uid,
      updatedAt: new Date()
    }

    if (profileExists.value) {
      await updateProfile(user.value.uid, profileData)
      M.toast({ html: 'Profile updated successfully!', classes: 'green' })
    } else {
      profileData.createdAt = new Date()
      await createProfile(profileData)
      profileExists.value = true
      M.toast({ html: 'Profile created successfully!', classes: 'green' })
    }
  } catch (err) {
    console.error('Error saving profile:', err)
    M.toast({ html: 'Error saving profile: ' + err.message, classes: 'red' })
  } finally {
    submitting.value = false
  }
}

const addQualification = () => {
  if (!canAddQualification.value) return

  profile.qualifications.push({
    title: newQualification.title.trim(),
    institution: newQualification.institution.trim(),
    year: newQualification.year
  })

  // Reset form
  newQualification.title = ''
  newQualification.institution = ''
  newQualification.year = new Date().getFullYear()
}

const removeQualification = (index) => {
  profile.qualifications.splice(index, 1)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // For now, we'll just create a placeholder URL
  // In a real app, you'd upload to Firebase Storage
  const reader = new FileReader()
  reader.onload = (e) => {
    profile.profilePicture = e.target.result
  }
  reader.readAsDataURL(file)
}

const resetForm = () => {
  loadProfile()
  Object.keys(errors).forEach(key => {
    errors[key] = null
  })
}

// Lifecycle
onMounted(async () => {
  await loadProfile()

  // Initialize Materialize components
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('select'))
    M.textareaAutoResize(document.getElementById('bio'))
  }, 100)
})
</script>
<style scoped>
.counsellor-profile {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-pic {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 1rem;
}

.profile-picture-section {
  padding: 1rem;
}

.qualification-item {
  margin-bottom: 0.5rem;
  padding: 1rem;
}

.qualification-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.add-qualification-form {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  margin-top: 1rem;
}

.specialization-chips,
.language-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.chip-container {
  margin-bottom: 0.5rem;
}

.chip-label {
  display: inline-block;
  padding: 8px 16px;
  background-color: #e0e0e0;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.chip-container input[type="checkbox"] {
  display: none;
}

.chip-container input[type="checkbox"]:checked + .chip-label {
  background-color: #2196f3;
  color: white;
}

.chip-container:hover .chip-label {
  background-color: #bdbdbd;
}

.chip-container input[type="checkbox"]:checked:hover + .chip-label {
  background-color: #1976d2;
}

.session-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.session-types label {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.session-types label:hover {
  background-color: #f5f5f5;
  border-color: #2196f3;
}

.session-types input[type="checkbox"]:checked + span {
  color: #2196f3;
  font-weight: 500;
}

.verification-status {
  text-align: center;
}

.verification-status .chip {
  margin: 0.5rem 0;
}

.verification-status .small {
  font-size: 0.8rem;
  line-height: 1.2;
}

.error-text {
  color: #f44336 !important;
  font-size: 0.8rem;
}

.profile-form .card {
  margin-bottom: 2rem;
}

.profile-form .card-title {
  margin-bottom: 1.5rem;
  color: #2196f3;
}

.profile-form .input-field {
  margin-bottom: 1.5rem;
}

@media only screen and (max-width: 600px) {
  .specialization-chips,
  .language-chips {
    flex-direction: column;
  }

  .session-types {
    gap: 0.5rem;
  }

  .session-types label {
    padding: 0.8rem;
  }

  .profile-pic {
    width: 120px;
    height: 120px;
  }
}
</style>
