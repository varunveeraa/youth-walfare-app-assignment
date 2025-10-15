// Database schema definitions for MindBridge application

// User document structure
export const UserSchema = {
  uid: 'string', // Firebase Auth UID
  email: 'string',
  displayName: 'string',
  role: 'string', // 'youth', 'counsellor', 'admin'
  age: 'number', // Required for youth users
  isActive: 'boolean',
  profilePicture: 'string', // URL to profile image
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  
  // Youth-specific fields
  preferences: {
    communicationMethod: 'string', // 'video', 'audio', 'chat'
    topics: 'array', // Array of interested topics
    notifications: 'boolean'
  },
  
  // Counsellor-specific fields (also stored in counsellorProfiles)
  isVerified: 'boolean', // For counsellors
  licenseNumber: 'string', // For counsellors
}

// Counsellor Profile document structure
export const CounsellorProfileSchema = {
  userId: 'string', // Reference to user document
  displayName: 'string',
  email: 'string',
  bio: 'string',
  specializations: 'array', // Array of specialization areas
  qualifications: 'array', // Array of qualification objects
  experience: 'number', // Years of experience
  licenseNumber: 'string',
  licenseState: 'string',
  isVerified: 'boolean',
  isActive: 'boolean',
  profilePicture: 'string',
  
  // Rating information
  averageRating: 'number',
  totalRatings: 'number',
  
  // Availability
  hourlyRate: 'number',
  sessionTypes: 'array', // ['video', 'audio', 'chat']
  languages: 'array',
  
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}

// Availability document structure
export const AvailabilitySchema = {
  counsellorId: 'string',
  dayOfWeek: 'number', // 0-6 (Sunday-Saturday)
  startTime: 'string', // HH:MM format
  endTime: 'string', // HH:MM format
  isAvailable: 'boolean',
  timezone: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}

// Resource document structure
export const ResourceSchema = {
  title: 'string',
  description: 'string',
  content: 'string', // HTML content
  category: 'string', // 'anxiety', 'depression', 'stress', 'relationships', etc.
  tags: 'array',
  authorId: 'string', // User ID of author
  authorName: 'string',
  isPublished: 'boolean',
  isFeatured: 'boolean',
  readTime: 'number', // Estimated read time in minutes
  views: 'number',
  likes: 'number',
  imageUrl: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}



// Appointment document structure
export const AppointmentSchema = {
  userId: 'string', // Youth user ID
  counsellorId: 'string',
  counsellorName: 'string',
  userName: 'string',
  
  appointmentDate: 'timestamp',
  duration: 'number', // Duration in minutes
  sessionType: 'string', // 'video', 'audio', 'chat'
  
  status: 'string', // 'scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'
  
  // Session details
  meetingLink: 'string', // For video/audio sessions
  notes: 'string', // Counsellor notes (private)
  userNotes: 'string', // User notes
  
  // Pricing
  cost: 'number',
  paymentStatus: 'string', // 'pending', 'paid', 'refunded'
  
  // Reminders
  reminderSent: 'boolean',
  
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}

// Rating document structure
export const RatingSchema = {
  userId: 'string', // Youth user who gave the rating
  counsellorId: 'string',
  appointmentId: 'string', // Reference to appointment
  
  rating: 'number', // 1-5 stars
  review: 'string', // Optional review text
  
  // Rating categories
  communication: 'number', // 1-5
  helpfulness: 'number', // 1-5
  professionalism: 'number', // 1-5
  
  isAnonymous: 'boolean',
  isApproved: 'boolean', // For moderation
  
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}

// Default values for new documents
export const getDefaultUser = (userData) => ({
  uid: userData.uid,
  email: userData.email,
  displayName: userData.displayName,
  role: userData.role || 'youth',
  age: userData.age || null,
  isActive: true,
  profilePicture: '',
  preferences: {
    communicationMethod: 'video',
    topics: [],
    notifications: true
  },
  isVerified: userData.role === 'counsellor' ? false : true,
  licenseNumber: userData.licenseNumber || '',
  createdAt: new Date(),
  updatedAt: new Date()
})

export const getDefaultCounsellorProfile = (userData) => ({
  userId: userData.uid,
  displayName: userData.displayName,
  email: userData.email,
  bio: '',
  specializations: [],
  qualifications: [],
  experience: 0,
  licenseNumber: userData.licenseNumber || '',
  licenseState: '',
  isVerified: false,
  isActive: false,
  profilePicture: '',
  averageRating: 0,
  totalRatings: 0,
  hourlyRate: 0,
  sessionTypes: ['video'],
  languages: ['English'],
  createdAt: new Date(),
  updatedAt: new Date()
})

export const getDefaultResource = (authorData) => ({
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [],
  authorId: authorData.uid,
  authorName: authorData.displayName,
  isPublished: false,
  isFeatured: false,
  readTime: 5,
  views: 0,
  likes: 0,
  imageUrl: '',
  createdAt: new Date(),
  updatedAt: new Date()
})


