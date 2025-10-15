<template>
  <div class="dashboard">
    <div class="container">


      <div class="row">
        <div class="col s12">
          <h4>Welcome back, {{ user?.displayName }}!</h4>
          <p class="grey-text">Here's your personalized dashboard based on your role.</p>
        </div>
      </div>
      
      <!-- Role-based dashboard content -->
      <div class="row">
        <!-- Youth User Dashboard -->
        <template v-if="isYouthUser">
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">library_books</i>
                  Resources
                </span>
                <p>Access mental health articles, tools, and self-help resources.</p>
              </div>
              <div class="card-action">
                <router-link to="/resources">Browse Resources</router-link>
              </div>
            </div>
          </div>
          
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">event</i>
                  Book Session
                </span>
                <p>Schedule a session with one of our licensed counsellors.</p>
              </div>
              <div class="card-action">
                <router-link to="/book-appointment">Book Now</router-link>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Counsellor Dashboard -->
        <template v-if="isCounsellor">
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">person</i>
                  My Profile
                </span>
                <p>Manage your professional profile and credentials.</p>
              </div>
              <div class="card-action">
                <router-link to="/counsellor/profile">Edit Profile</router-link>
              </div>
            </div>
          </div>
          
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">event</i>
                  Appointments
                </span>
                <p>View and manage your upcoming appointments.</p>
              </div>
              <div class="card-action">
                <router-link to="/counsellor/appointments">View Appointments</router-link>
              </div>
            </div>
          </div>
          
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">schedule</i>
                  Availability
                </span>
                <p>Set your availability for new appointments.</p>
              </div>
              <div class="card-action">
                <router-link to="/counsellor/availability">Set Availability</router-link>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Admin Dashboard -->
        <template v-if="isAdmin">
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">people</i>
                  User Management
                </span>
                <p>Manage users, roles, and permissions.</p>
              </div>
              <div class="card-action">
                <router-link to="/admin/users">Manage Users</router-link>
              </div>
            </div>
          </div>
          
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">content_paste</i>
                  Content Management
                </span>
                <p>Manage resources and platform content.</p>
              </div>
              <div class="card-action">
                <router-link to="/admin/content">Manage Content</router-link>
              </div>
            </div>
          </div>
          
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">settings</i>
                  Platform Settings
                </span>
                <p>Configure platform settings and preferences.</p>
              </div>
              <div class="card-action">
                <router-link to="/admin/settings">Settings</router-link>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Quick Stats -->
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Quick Stats</span>
              <div class="row">
                <div class="col s12 m4 center-align">
                  <h5 class="teal-text">{{ stats.totalUsers }}</h5>
                  <p>Total Users</p>
                </div>
                <div class="col s12 m4 center-align">
                  <h5 class="teal-text">{{ stats.activeSessions }}</h5>
                  <p>Active Sessions</p>
                </div>
                <div class="col s12 m4 center-align">
                  <h5 class="teal-text">{{ stats.resourcesAvailable }}</h5>
                  <p>Resources Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
const { user, isYouthUser, isCounsellor, isAdmin } = useAuth()

const stats = ref({
  totalUsers: 1247,
  activeSessions: 23,
  resourcesAvailable: 89
})

onMounted(() => {
  // In a real app, you would fetch these stats from your API
  // For now, we're using mock data
  // Note: Role-based redirects are now handled by router guards
})
</script>

<style scoped>
.dashboard {
  padding: 2rem 0;
}

.card {
  height: 100%;
}

.card-title i {
  font-size: 1.5rem;
}

.card:hover {
  box-shadow: 0 8px 17px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  transition: box-shadow 0.3s ease;
}
</style>
