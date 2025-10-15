<template>
  <nav class="nav-wrapper teal darken-2">
    <div class="container">
      <router-link to="/" class="brand-logo">
        <i class="material-icons left">psychology</i>
        MindBridge
      </router-link>
      
      <!-- Mobile menu trigger -->
      <a href="#" data-target="mobile-nav" class="sidenav-trigger">
        <i class="material-icons">menu</i>
      </a>
      
      <!-- Desktop navigation -->
      <ul class="right hide-on-med-and-down">
        <template v-if="!isAuthenticated">
          <li><router-link to="/login">Login</router-link></li>
          <li><router-link to="/register">Register</router-link></li>
        </template>
        
        <template v-else>
          <!-- Youth User Navigation -->
          <template v-if="isYouthUser">
            <li><router-link to="/youth">Dashboard</router-link></li>
            <li><router-link to="/resources">Resources</router-link></li>
            <li><router-link to="/community">Community</router-link></li>
            <li><router-link to="/book-appointment">Book Session</router-link></li>
          </template>
          
          <!-- Counsellor Navigation -->
          <template v-if="isCounsellor">
            <li><router-link to="/counsellor">Dashboard</router-link></li>
            <li><router-link to="/counsellor/profile">Profile</router-link></li>
            <li><router-link to="/counsellor/appointments">Appointments</router-link></li>
            <li><router-link to="/counsellor/availability">Availability</router-link></li>
          </template>
          
          <!-- Admin Navigation -->
          <template v-if="isAdmin">
            <li><router-link to="/admin">Admin</router-link></li>
            <li><router-link to="/admin/users">Users</router-link></li>
            <li><router-link to="/admin/content">Content</router-link></li>
          </template>
          
          <!-- User dropdown -->
          <li>
            <a class="dropdown-trigger" href="#!" data-target="user-dropdown">
              <i class="material-icons left">account_circle</i>
              {{ user?.displayName || 'User' }}
              <i class="material-icons right">arrow_drop_down</i>
            </a>
          </li>
        </template>
      </ul>
      
      <!-- User dropdown content -->
      <ul id="user-dropdown" class="dropdown-content" v-if="isAuthenticated">
        <li><a href="#" @click="handleLogout">
          <i class="material-icons left">logout</i>Logout
        </a></li>
      </ul>
    </div>
  </nav>
  
  <!-- Mobile navigation -->
  <ul class="sidenav" id="mobile-nav">
    <li>
      <div class="user-view">
        <div class="background teal darken-2"></div>
        <a href="#user">
          <i class="material-icons circle white-text">account_circle</i>
        </a>
        <a href="#name">
          <span class="white-text name">{{ user?.displayName || 'Guest' }}</span>
        </a>
        <a href="#email">
          <span class="white-text email">{{ user?.email || '' }}</span>
        </a>
      </div>
    </li>
    
    <template v-if="!isAuthenticated">
      <li><router-link to="/login">Login</router-link></li>
      <li><router-link to="/register">Register</router-link></li>
    </template>
    
    <template v-else>
      <!-- Mobile menu items based on role -->
      <template v-if="isYouthUser">
        <li><router-link to="/youth">Dashboard</router-link></li>
        <li><router-link to="/resources">Resources</router-link></li>
        <li><router-link to="/community">Community</router-link></li>
        <li><router-link to="/book-appointment">Book Session</router-link></li>
      </template>
      
      <template v-if="isCounsellor">
        <li><router-link to="/counsellor">Dashboard</router-link></li>
        <li><router-link to="/counsellor/profile">Profile</router-link></li>
        <li><router-link to="/counsellor/appointments">Appointments</router-link></li>
      </template>
      
      <template v-if="isAdmin">
        <li><router-link to="/admin">Admin Dashboard</router-link></li>
        <li><router-link to="/admin/users">User Management</router-link></li>
        <li><router-link to="/admin/content">Content Management</router-link></li>
      </template>
      
      <li><div class="divider"></div></li>
      <li><a href="#" @click="handleLogout">
        <i class="material-icons left">logout</i>Logout
      </a></li>
    </template>
  </ul>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { user, isAuthenticated, isYouthUser, isCounsellor, isAdmin, logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(() => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    M.Sidenav.init(document.querySelectorAll('.sidenav'))
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'))
  }
})
</script>

<style scoped>
.brand-logo {
  font-size: 1.8rem !important;
}

.nav-wrapper .brand-logo i {
  font-size: 2rem;
}

@media only screen and (max-width: 992px) {
  .brand-logo {
    font-size: 1.5rem !important;
  }
}
</style>
