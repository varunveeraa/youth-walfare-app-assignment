import { useAuth } from '@/composables/useAuth'

// Generic guard factory
const createGuard = (checkFn, redirectFn) => (to, from, next) => {
  const auth = useAuth()

  // Wait for auth state to be determined
  if (auth.loading.value) {
    setTimeout(() => createGuard(checkFn, redirectFn)(to, from, next), 100)
    return
  }

  if (checkFn(auth)) {
    next()
  } else {
    redirectFn(to, from, next, auth)
  }
}

// Role-specific dashboard mapping
const getDashboardRoute = (auth) => {
  if (auth.isYouthUser.value) return { name: 'StudentDashboard' }
  if (auth.isCounsellor.value) return { name: 'TherapistDashboard' }
  if (auth.isAdmin.value) return { name: 'AdminControlPanel' }
  return { name: 'MainDashboard' }
}

// Authentication guard - requires user to be logged in
export const requireAuth = createGuard(
  (auth) => auth.isAuthenticated.value,
  (to, from, next) => next({ name: 'SignIn', query: { redirect: to.fullPath } })
)

// Guest guard - redirects authenticated users away from auth pages
export const requireGuest = createGuard(
  (auth) => !auth.isAuthenticated.value,
  (to, from, next, auth) => next(getDashboardRoute(auth))
)

// Role-based guards using the factory
const createRoleGuard = (roleCheck) => createGuard(
  (auth) => auth.isAuthenticated.value && roleCheck(auth),
  (to, from, next, auth) => {
    if (!auth.isAuthenticated.value) {
      next({ name: 'SignIn', query: { redirect: to.fullPath } })
    } else {
      next({ name: 'AccessDenied' })
    }
  }
)

export const requireYouthUser = createRoleGuard((auth) => auth.isYouthUser.value)
export const requireCounsellor = createRoleGuard((auth) => auth.isCounsellor.value)
export const requireAdmin = createRoleGuard((auth) => auth.isAdmin.value)

// Combined guard for multiple roles
export const requireRole = (allowedRoles) => {
  return (to, from, next) => {
    const { isAuthenticated, userRole, loading } = useAuth()

    if (loading.value) {
      setTimeout(() => requireRole(allowedRoles)(to, from, next), 100)
      return
    }

    if (!isAuthenticated.value) {
      next({ name: 'SignIn', query: { redirect: to.fullPath } })
    } else if (allowedRoles.includes(userRole.value)) {
      next()
    } else {
      next({ name: 'AccessDenied' })
    }
  }
}

// Smart dashboard guard - redirects to role-specific dashboard immediately
export const requireDashboard = (to, from, next) => {
  const { isAuthenticated, isYouthUser, isCounsellor, isAdmin, loading } = useAuth()

  if (loading.value) {
    setTimeout(() => requireDashboard(to, from, next), 100)
    return
  }

  if (!isAuthenticated.value) {
    next({ name: 'SignIn', query: { redirect: to.fullPath } })
    return
  }

  // Immediately redirect to role-specific dashboard
  if (isYouthUser.value) {
    next({ name: 'StudentDashboard' })
  } else if (isCounsellor.value) {
    next({ name: 'TherapistDashboard' })
  } else if (isAdmin.value) {
    next({ name: 'AdminControlPanel' })
  } else {
    // Fallback - stay on general dashboard if role is unclear
    next()
  }
}
