import { useAuth } from '@/composables/useAuth'

// Authentication guard - requires user to be logged in
export const requireAuth = (to, from, next) => {
  const { isAuthenticated, loading } = useAuth()
  
  // Wait for auth state to be determined
  if (loading.value) {
    // You might want to show a loading spinner here
    setTimeout(() => requireAuth(to, from, next), 100)
    return
  }
  
  if (isAuthenticated.value) {
    next()
  } else {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  }
}

// Guest guard - redirects authenticated users away from auth pages
export const requireGuest = (to, from, next) => {
  const { isAuthenticated, loading } = useAuth()
  
  // Wait for auth state to be determined
  if (loading.value) {
    setTimeout(() => requireGuest(to, from, next), 100)
    return
  }
  
  if (!isAuthenticated.value) {
    next()
  } else {
    // Redirect authenticated users to their role-specific dashboard
    const { isYouthUser, isCounsellor, isAdmin } = useAuth()
    if (isYouthUser.value) {
      next({ name: 'YouthDashboard' })
    } else if (isCounsellor.value) {
      next({ name: 'CounsellorDashboard' })
    } else if (isAdmin.value) {
      next({ name: 'AdminDashboard' })
    } else {
      next({ name: 'Dashboard' })
    }
  }
}

// Role-based guards
export const requireYouthUser = (to, from, next) => {
  const { isAuthenticated, isYouthUser, loading } = useAuth()
  
  if (loading.value) {
    setTimeout(() => requireYouthUser(to, from, next), 100)
    return
  }
  
  if (!isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (isYouthUser.value) {
    next()
  } else {
    next({ name: 'Unauthorized' })
  }
}

export const requireCounsellor = (to, from, next) => {
  const { isAuthenticated, isCounsellor, loading } = useAuth()
  
  if (loading.value) {
    setTimeout(() => requireCounsellor(to, from, next), 100)
    return
  }
  
  if (!isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (isCounsellor.value) {
    next()
  } else {
    next({ name: 'Unauthorized' })
  }
}

export const requireAdmin = (to, from, next) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  
  if (loading.value) {
    setTimeout(() => requireAdmin(to, from, next), 100)
    return
  }
  
  if (!isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (isAdmin.value) {
    next()
  } else {
    next({ name: 'Unauthorized' })
  }
}

// Combined guard for multiple roles
export const requireRole = (allowedRoles) => {
  return (to, from, next) => {
    const { isAuthenticated, userRole, loading } = useAuth()

    if (loading.value) {
      setTimeout(() => requireRole(allowedRoles)(to, from, next), 100)
      return
    }

    if (!isAuthenticated.value) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (allowedRoles.includes(userRole.value)) {
      next()
    } else {
      next({ name: 'Unauthorized' })
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
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Immediately redirect to role-specific dashboard
  if (isYouthUser.value) {
    next({ name: 'YouthDashboard' })
  } else if (isCounsellor.value) {
    next({ name: 'CounsellorDashboard' })
  } else if (isAdmin.value) {
    next({ name: 'AdminDashboard' })
  } else {
    // Fallback - stay on general dashboard if role is unclear
    next()
  }
}
