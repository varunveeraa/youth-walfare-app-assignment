<template>
  <header role="banner">
    <nav class="navigation-bar teal darken-2" role="navigation" aria-label="Main navigation">
      <div class="container">
        <router-link to="/" class="app-brand" aria-label="MindBridge - Go to homepage">
          <i class="material-icons left" aria-hidden="true">psychology</i>
          MindBridge
        </router-link>

        <!-- Mobile navigation trigger -->
        <button
          type="button"
          data-target="mobile-navigation"
          class="mobile-menu-trigger"
          aria-label="Open mobile menu"
          aria-expanded="false"
          aria-controls="mobile-navigation"
        >
          <i class="material-icons" aria-hidden="true">menu</i>
        </button>

        <!-- Primary navigation menu -->
        <ul class="right primary-nav" role="menubar">
          <template v-if="loading || !hasActiveSession">
            <li role="none"><router-link to="/login" role="menuitem">Sign In</router-link></li>
            <li role="none"><router-link to="/register" role="menuitem">Join Us</router-link></li>
          </template>

        <template v-else-if="hasActiveSession">
          <!-- Student User Navigation -->
          <template v-if="isStudentAccount">
            <li role="none"><router-link to="/youth" role="menuitem">My Dashboard</router-link></li>
            <li role="none"><router-link to="/resources" role="menuitem">Resources</router-link></li>
            <li role="none"><router-link to="/counsellors" role="menuitem">Find Your Counsellor</router-link></li>
            <li role="none">
              <router-link to="/location" role="menuitem">
                <i class="material-icons left" aria-hidden="true">nature_people</i>Wellness Map
              </router-link>
            </li>
            <li role="none"><router-link to="/my-appointments" role="menuitem">My Appointments</router-link></li>
          </template>

          <!-- Therapist Navigation -->
          <template v-if="isTherapistAccount">
            <li role="none"><router-link to="/counsellor" role="menuitem">Control Panel</router-link></li>
            <li role="none"><router-link to="/counsellor/profile" role="menuitem">My Profile</router-link></li>
            <li role="none"><router-link to="/counsellor/appointments" role="menuitem">Sessions</router-link></li>
          </template>

          <!-- Administrator Navigation -->
          <template v-if="isAdminAccount">
            <li role="none"><router-link to="/admin" role="menuitem">Administration</router-link></li>
            <li role="none"><router-link to="/admin/users" role="menuitem">User Management</router-link></li>
          </template>

          <!-- Logout option -->
          <li role="none">
            <button
              type="button"
              @click="processLogout"
              @keydown="handleLogoutKeydown"
              class="logout-btn red-text logout-link"
              role="menuitem"
              aria-label="Sign out of your account"
            >
              <i class="material-icons left" aria-hidden="true">logout</i>Sign Out
            </button>
          </li>
        </template>
      </ul>
    </div>
  </nav>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { user: currentUser, isAuthenticated: hasActiveSession, isYouthUser: isStudentAccount, isCounsellor: isTherapistAccount, isAdmin: isAdminAccount, logout, loading } = useAuth()
const router = useRouter()

const processLogout = async (event) => {
  event.preventDefault()

  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Accessibility: Handle keyboard events for logout button
const handleLogoutKeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    processLogout(event)
  }
}
</script>

<style scoped>
/* Ensure navigation is visible and properly positioned */
.navigation-bar {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  width: 100% !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
}

.navigation-bar .container {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 20px !important;
}

.primary-nav {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
}

.primary-nav li {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  margin: 0 5px !important;
}

.primary-nav li a {
  color: white !important;
  text-decoration: none !important;
  padding: 8px 16px !important;
  border-radius: 4px !important;
  transition: background-color 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
}

.primary-nav li a:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.app-brand {
  font-size: 1.8rem !important;
  font-weight: 600 !important;
  color: white !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
}

.app-brand i {
  font-size: 2rem !important;
  margin-right: 0.3rem !important;
}

.logout-link {
  color: #ffcdd2 !important;
}

.logout-link:hover {
  color: #ff5252 !important;
  background-color: rgba(255, 82, 82, 0.1) !important;
}

/* Override any Materialize hiding */
.hide-on-med-and-down {
  display: block !important;
}

/* Mobile navigation trigger */
.mobile-menu-trigger {
  display: none !important;
}

/* Accessibility: Logout button styling */
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease, background-color 0.3s ease;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.logout-btn:hover {
  color: #ffcdd2 !important;
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Accessibility: Enhanced mobile menu button */
.mobile-menu-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-menu-trigger:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
  background-color: rgba(255, 255, 255, 0.1);
}

@media only screen and (max-width: 992px) {
  .primary-nav {
    display: none !important;
  }

  .mobile-menu-trigger {
    display: block !important;
    color: white !important;
  }
}
</style>
