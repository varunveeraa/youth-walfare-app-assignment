<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- Welcome Section -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel red lighten-5">
            <h4 class="red-text">Admin Control Panel 🛡️</h4>
            <p class="grey-text text-darken-1">
              Welcome, {{ user?.displayName }}. Manage the MindBridge platform and ensure a safe environment for all users.
            </p>
          </div>
        </div>
      </div>

      <!-- Management Tools -->
      <div class="row">
        <div class="col s12">
          <h5>Platform Management</h5>
        </div>

        <div class="col s12 m6 l4">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large red-text">people</i>
              <span class="card-title">User Management</span>
              <p>Manage users, roles, and permissions</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/admin/users" class="btn red">Manage</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l4">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large red-text">content_paste</i>
              <span class="card-title">Content Management</span>
              <p>Moderate posts and resources</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/admin/content" class="btn red">Moderate</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l4">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large red-text">settings</i>
              <span class="card-title">Platform Settings</span>
              <p>Configure system preferences</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/admin/settings" class="btn red">Configure</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Statistics -->
      <div class="row">
        <div class="col s12">
          <h5>Platform Overview</h5>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="red-text">{{ platformStats.totalUsers }}</h4>
            <p>Total Users</p>
            <small class="green-text">+{{ platformStats.newUsersToday }} today</small>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="red-text">{{ platformStats.activeCounsellors }}</h4>
            <p>Active Counsellors</p>
            <small class="blue-text">{{ platformStats.onlineCounsellors }} online</small>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="red-text">{{ platformStats.sessionsToday }}</h4>
            <p>Sessions Today</p>
            <small class="orange-text">{{ platformStats.pendingReports }} pending reports</small>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="red-text">{{ platformStats.communityPosts }}</h4>
            <p>Community Posts</p>
            <small class="purple-text">{{ platformStats.flaggedPosts }} flagged</small>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Alerts -->
      <div class="row">
        <div class="col s12 m8">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Recent Platform Activity</span>
              <div class="collection">
                <div class="collection-item" v-for="activity in recentActivity" :key="activity.id">
                  <i class="material-icons left" :class="activity.iconClass">{{ activity.icon }}</i>
                  <span>{{ activity.description }}</span>
                  <span class="secondary-content grey-text">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="card">
            <div class="card-content">
              <span class="card-title">System Alerts</span>
              <div class="collection">
                <div class="collection-item" v-for="alert in systemAlerts" :key="alert.id">
                  <span class="chip {{ alert.severityClass }}">{{ alert.severity }}</span>
                  <p style="margin-top: 0.5rem;">{{ alert.message }}</p>
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
              <span class="card-title">Quick Actions</span>
              <div class="row">
                <div class="col s12 m6 l3">
                  <button class="btn-large red lighten-1 full-width">
                    <i class="material-icons left">block</i>
                    Emergency Ban
                  </button>
                </div>
                <div class="col s12 m6 l3">
                  <button class="btn-large orange full-width">
                    <i class="material-icons left">announcement</i>
                    Send Alert
                  </button>
                </div>
                <div class="col s12 m6 l3">
                  <button class="btn-large blue full-width">
                    <i class="material-icons left">backup</i>
                    Backup Data
                  </button>
                </div>
                <div class="col s12 m6 l3">
                  <button class="btn-large green full-width">
                    <i class="material-icons left">refresh</i>
                    System Check
                  </button>
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

const { user } = useAuth()

const platformStats = ref({
  totalUsers: 1247,
  newUsersToday: 23,
  activeCounsellors: 45,
  onlineCounsellors: 12,
  sessionsToday: 89,
  pendingReports: 3,
  communityPosts: 156,
  flaggedPosts: 2
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'person_add',
    iconClass: 'green-text',
    description: 'New counsellor registered: Dr. Sarah Johnson',
    time: '5 min ago'
  },
  {
    id: 2,
    icon: 'flag',
    iconClass: 'orange-text',
    description: 'Community post flagged for review',
    time: '15 min ago'
  },
  {
    id: 3,
    icon: 'verified_user',
    iconClass: 'blue-text',
    description: 'Counsellor verification completed: Dr. Mike Chen',
    time: '1 hour ago'
  },
  {
    id: 4,
    icon: 'report',
    iconClass: 'red-text',
    description: 'User report submitted - requires review',
    time: '2 hours ago'
  }
])

const systemAlerts = ref([
  {
    id: 1,
    severity: 'HIGH',
    severityClass: 'red white-text',
    message: '2 posts require immediate moderation'
  },
  {
    id: 2,
    severity: 'MEDIUM',
    severityClass: 'orange white-text',
    message: 'Server load at 85% capacity'
  },
  {
    id: 3,
    severity: 'LOW',
    severityClass: 'blue white-text',
    message: 'Weekly backup scheduled for tonight'
  }
])

onMounted(() => {
  // In a real app, fetch admin-specific data and alerts
})
</script>

<style scoped>
.admin-dashboard {
  padding: 1rem 0;
}

.card:hover {
  box-shadow: 0 8px 17px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  transition: box-shadow 0.3s ease;
}

.card-panel {
  margin: 0.5rem 0;
}

.material-icons.large {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.chip {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.full-width {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
