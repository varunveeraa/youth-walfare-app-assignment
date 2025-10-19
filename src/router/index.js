import { createRouter, createWebHistory } from 'vue-router'
import { requireGuest, requireYouthUser, requireCounsellor, requireAdmin, requireDashboard } from './guards'

// Asynchronous component loading for performance optimization
const LandingPageInterface = () => import('@/views/Home.vue')
const AuthenticationPortal = () => import('@/views/auth/Login.vue')
const UserRegistrationPortal = () => import('@/views/auth/Register.vue')
const CentralDashboardInterface = () => import('@/views/Dashboard.vue')
const UnauthorizedAccessInterface = () => import('@/views/Unauthorized.vue')

// Youth user workspace components
const YouthUserWorkspace = () => import('@/views/youth/YouthDashboard.vue')
const WellnessResourceRepository = () => import('@/views/youth/Resources.vue')
const PersonalSessionHistory = () => import('@/views/youth/MyAppointments.vue')

// Professional counsellor workspace components
const CounsellorWorkspaceInterface = () => import('@/views/counsellor/CounsellorDashboard.vue')
const CounsellorProfileManagement = () => import('@/views/counsellor/CounsellorProfile.vue')
const CounsellorSessionManagement = () => import('@/views/counsellor/CounsellorAppointments.vue')
const CounsellorAvailabilityManager = () => import('@/views/counsellor/CounsellorAvailability.vue')

// System administration workspace components
const SystemAdministrationInterface = () => import('@/views/admin/AdminDashboard.vue')
const CommunicationManagementSystem = () => import('@/views/admin/EmailManagement.vue')
const UserAccountManagementSystem = () => import('@/views/admin/UserManagement.vue')
const ProfessionalDirectoryInterface = () => import('@/views/CounsellorDirectory.vue')
const ContentManagementSystem = () => import('@/views/admin/ContentManagement.vue')
const PlatformConfigurationInterface = () => import('@/views/admin/PlatformSettings.vue')

// Geographic wellness discovery interface
const TherapeuticLocationDiscovery = () => import('@/views/GeoLocation.vue')



const applicationRoutes = [
  {
    path: '/',
    name: 'HomePage',
    component: LandingPageInterface
  },
  {
    path: '/login',
    name: 'SignIn',
    component: AuthenticationPortal,
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'Registration',
    component: UserRegistrationPortal,
    beforeEnter: requireGuest
  },
  {
    path: '/dashboard',
    name: 'MainDashboard',
    component: CentralDashboardInterface,
    beforeEnter: requireDashboard
  },
  {
    path: '/unauthorized',
    name: 'AccessDenied',
    component: UnauthorizedAccessInterface
  },

  // Student user interface routes
  {
    path: '/youth',
    name: 'StudentDashboard',
    component: YouthUserWorkspace,
    beforeEnter: requireYouthUser
  },
  {
    path: '/resources',
    name: 'ResourceLibrary',
    component: WellnessResourceRepository,
    beforeEnter: requireYouthUser
  },
  {
    path: '/my-appointments',
    name: 'MySessionHistory',
    component: PersonalSessionHistory,
    beforeEnter: requireYouthUser
  },
  {
    path: '/rate-counsellor/:appointmentId',
    name: 'TherapistRating',
    component: () => import('@/views/youth/RateCounsellor.vue'),
    beforeEnter: requireYouthUser
  },
  {
    path: '/location',
    name: 'WellnessLocations',
    component: TherapeuticLocationDiscovery
    // Publicly accessible route
  },

  // Therapist interface routes
  {
    path: '/counsellor',
    name: 'TherapistDashboard',
    component: CounsellorWorkspaceInterface,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/profile',
    name: 'TherapistProfile',
    component: CounsellorProfileManagement,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/appointments',
    name: 'TherapistSessions',
    component: CounsellorSessionManagement,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/availability',
    name: 'TherapistSchedule',
    component: CounsellorAvailabilityManager,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/ratings',
    name: 'TherapistFeedback',
    component: () => import('@/views/counsellor/CounsellorRatings.vue'),
    beforeEnter: requireCounsellor
  },

  // Administrative interface routes
  {
    path: '/admin',
    name: 'AdminControlPanel',
    component: SystemAdministrationInterface,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/emails',
    name: 'EmailAdministration',
    component: CommunicationManagementSystem,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/users',
    name: 'UserAdministration',
    component: UserAccountManagementSystem,
    beforeEnter: requireAdmin
  },
  {
    path: '/counsellors',
    name: 'TherapistDirectory',
    component: ProfessionalDirectoryInterface
    // Publicly accessible route
  },
  {
    path: '/admin/content',
    name: 'ContentAdministration',
    component: ContentManagementSystem,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/settings',
    name: 'SystemSettings',
    component: PlatformConfigurationInterface,
    beforeEnter: requireAdmin
  },



  // Fallback route for unmatched paths
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const applicationRouter = createRouter({
  history: createWebHistory(),
  routes: applicationRoutes
})

export default applicationRouter
