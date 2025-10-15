<template>
  <div class="counsellor-dashboard">
    <div class="container">
      <!-- Welcome Section -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel blue lighten-5">
            <h4 class="blue-text">Welcome, Dr. {{ user?.displayName }}! 👨‍⚕️</h4>
            <p class="grey-text text-darken-1">
              Your professional dashboard to manage your practice and help young people thrive.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col s12">
          <h5>Practice Management</h5>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large blue-text">person</i>
              <span class="card-title">My Profile</span>
              <p>Update credentials and bio</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/counsellor/profile" class="btn blue">Manage</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large blue-text">event</i>
              <span class="card-title">Appointments</span>
              <p>View and manage sessions</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/counsellor/appointments" class="btn blue">View</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large blue-text">schedule</i>
              <span class="card-title">Availability</span>
              <p>Set your working hours</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/counsellor/availability" class="btn blue">Update</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large blue-text">star</i>
              <span class="card-title">Ratings</span>
              <p>View client feedback</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/counsellor/ratings" class="btn blue">View</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Stats -->
      <div class="row">
        <div class="col s12">
          <h5>Performance Overview</h5>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="blue-text">{{ practiceStats.totalClients }}</h4>
            <p>Total Clients</p>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="blue-text">{{ practiceStats.sessionsThisMonth }}</h4>
            <p>Sessions This Month</p>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="blue-text">{{ practiceStats.averageRating }}</h4>
            <p>Average Rating</p>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="blue-text">{{ practiceStats.hoursAvailable }}</h4>
            <p>Hours Available</p>
          </div>
        </div>
      </div>

      <!-- Today's Schedule & Recent Activity -->
      <div class="row">
        <div class="col s12 m8">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Today's Schedule</span>
              <div class="collection">
                <div class="collection-item" v-for="appointment in todaysSchedule" :key="appointment.id">
                  <i class="material-icons left">{{ appointment.icon }}</i>
                  <span><strong>{{ appointment.time }}</strong> - {{ appointment.client }}</span>
                  <span class="secondary-content">
                    <span class="chip {{ appointment.statusClass }}">{{ appointment.status }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Recent Reviews</span>
              <div class="collection">
                <div class="collection-item" v-for="review in recentReviews" :key="review.id">
                  <div class="row valign-wrapper">
                    <div class="col s8">
                      <span class="truncate">{{ review.comment }}</span>
                    </div>
                    <div class="col s4 right-align">
                      <span class="chip yellow lighten-2">
                        {{ review.rating }} ⭐
                      </span>
                    </div>
                  </div>
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

const practiceStats = ref({
  totalClients: 24,
  sessionsThisMonth: 18,
  averageRating: 4.8,
  hoursAvailable: 32
})

const todaysSchedule = ref([
  {
    id: 1,
    time: '9:00 AM',
    client: 'Sarah M.',
    status: 'Confirmed',
    statusClass: 'green white-text',
    icon: 'event'
  },
  {
    id: 2,
    time: '11:00 AM',
    client: 'John D.',
    status: 'Pending',
    statusClass: 'orange white-text',
    icon: 'event'
  },
  {
    id: 3,
    time: '2:00 PM',
    client: 'Emma L.',
    status: 'Confirmed',
    statusClass: 'green white-text',
    icon: 'event'
  },
  {
    id: 4,
    time: '4:00 PM',
    client: 'Available',
    status: 'Open',
    statusClass: 'blue white-text',
    icon: 'event_available'
  }
])

const recentReviews = ref([
  { id: 1, comment: 'Very helpful and understanding...', rating: 5 },
  { id: 2, comment: 'Great session, felt much better...', rating: 5 },
  { id: 3, comment: 'Professional and caring...', rating: 4 },
  { id: 4, comment: 'Excellent communication...', rating: 5 }
])

onMounted(() => {
  // In a real app, fetch counsellor-specific data
})
</script>

<style scoped>
.counsellor-dashboard {
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
}
</style>
