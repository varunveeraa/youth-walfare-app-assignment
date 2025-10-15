<template>
  <div class="youth-dashboard">
    <div class="container">
      <!-- Welcome Section -->
      <div class="row">
        <div class="col s12">
          <div class="card-panel teal lighten-5">
            <h4 class="teal-text">Welcome back, {{ user?.displayName }}! 🌟</h4>
            <p class="grey-text text-darken-1">
              Your mental health journey matters. Here's your personalized dashboard to help you thrive.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col s12">
          <h5>Quick Actions</h5>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large teal-text">library_books</i>
              <span class="card-title">Resources</span>
              <p>Explore mental health articles and tools</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/resources" class="btn teal">Browse</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large teal-text">event</i>
              <span class="card-title">Book Session</span>
              <p>Schedule with a counsellor</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/book-appointment" class="btn teal">Book</router-link>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card hoverable">
            <div class="card-content center-align">
              <i class="material-icons large teal-text">schedule</i>
              <span class="card-title">My Sessions</span>
              <p>View your appointments</p>
            </div>
            <div class="card-action center-align">
              <router-link to="/my-appointments" class="btn teal">View</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Stats -->
      <div class="row">
        <div class="col s12">
          <h5>Your Progress</h5>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="teal-text">{{ userStats.sessionsCompleted }}</h4>
            <p>Sessions Completed</p>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="teal-text">{{ userStats.resourcesViewed }}</h4>
            <p>Resources Viewed</p>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <h4 class="teal-text">{{ userStats.daysActive }}</h4>
            <p>Days Active</p>
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

const userStats = ref({
  sessionsCompleted: 3,
  resourcesViewed: 12,
  daysActive: 14
})



onMounted(() => {
  // In a real app, fetch user-specific data
})
</script>

<style scoped>
.youth-dashboard {
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
</style>
