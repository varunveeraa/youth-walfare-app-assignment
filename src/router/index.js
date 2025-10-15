import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest, requireYouthUser, requireCounsellor, requireAdmin } from './guards'

// Lazy load components for better performance
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Unauthorized = () => import('@/views/Unauthorized.vue')

// Youth User Routes
const YouthDashboard = () => import('@/views/youth/YouthDashboard.vue')
const Resources = () => import('@/views/youth/Resources.vue')
const Community = () => import('@/views/youth/Community.vue')
const BookAppointment = () => import('@/views/youth/BookAppointment.vue')
const MyAppointments = () => import('@/views/youth/MyAppointments.vue')

// Counsellor Routes
const CounsellorDashboard = () => import('@/views/counsellor/CounsellorDashboard.vue')
const CounsellorProfile = () => import('@/views/counsellor/CounsellorProfile.vue')
const CounsellorAppointments = () => import('@/views/counsellor/CounsellorAppointments.vue')
const CounsellorAvailability = () => import('@/views/counsellor/CounsellorAvailability.vue')

// Admin Routes
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const UserManagement = () => import('@/views/admin/UserManagement.vue')
const ContentManagement = () => import('@/views/admin/ContentManagement.vue')
const PlatformSettings = () => import('@/views/admin/PlatformSettings.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    beforeEnter: requireGuest
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized
  },
  
  // Youth User Routes
  {
    path: '/youth',
    name: 'YouthDashboard',
    component: YouthDashboard,
    beforeEnter: requireYouthUser
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    beforeEnter: requireYouthUser
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    beforeEnter: requireYouthUser
  },
  {
    path: '/book-appointment',
    name: 'BookAppointment',
    component: BookAppointment,
    beforeEnter: requireYouthUser
  },
  {
    path: '/my-appointments',
    name: 'MyAppointments',
    component: MyAppointments,
    beforeEnter: requireYouthUser
  },
  {
    path: '/rate-counsellor/:appointmentId',
    name: 'RateCounsellor',
    component: () => import('@/views/youth/RateCounsellor.vue'),
    beforeEnter: requireYouthUser
  },
  
  // Counsellor Routes
  {
    path: '/counsellor',
    name: 'CounsellorDashboard',
    component: CounsellorDashboard,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/profile',
    name: 'CounsellorProfile',
    component: CounsellorProfile,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/appointments',
    name: 'CounsellorAppointments',
    component: CounsellorAppointments,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/availability',
    name: 'CounsellorAvailability',
    component: CounsellorAvailability,
    beforeEnter: requireCounsellor
  },
  {
    path: '/counsellor/ratings',
    name: 'CounsellorRatings',
    component: () => import('@/views/counsellor/CounsellorRatings.vue'),
    beforeEnter: requireCounsellor
  },
  
  // Admin Routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/content',
    name: 'ContentManagement',
    component: ContentManagement,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/settings',
    name: 'PlatformSettings',
    component: PlatformSettings,
    beforeEnter: requireAdmin
  },
  
  // Catch all route - 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
