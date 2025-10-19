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
          <div class="row valign-wrapper">
            <div class="col s8">
              <h5>Performance Overview</h5>
            </div>
            <div class="col s4 right-align">

              <button
                @click="handleRefreshStats"
                class="btn-small blue waves-effect waves-light"
                :disabled="loading"
                style="margin-left: 0.5rem;"
              >
                <i class="material-icons left">refresh</i>
                {{ loading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>
          <div v-if="error" class="card-panel red lighten-4 red-text">
            <i class="material-icons left">error</i>
            Error loading statistics: {{ error }}
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <div v-if="loading" class="preloader-wrapper small active">
              <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
            <div v-else>
              <h4 class="blue-text">{{ practiceStats.totalClients }}</h4>
              <p>Total Clients</p>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <div v-if="loading" class="preloader-wrapper small active">
              <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
            <div v-else>
              <h4 class="blue-text">{{ practiceStats.sessionsThisMonth }}</h4>
              <p>Sessions This Month</p>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <div v-if="loading" class="preloader-wrapper small active">
              <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
            <div v-else>
              <h4 class="blue-text">{{ practiceStats.averageRating }}</h4>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        <div class="col s12 m6 l3">
          <div class="card-panel center-align">
            <div v-if="loading" class="preloader-wrapper small active">
              <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
            <div v-else>
              <h4 class="blue-text">{{ practiceStats.hoursAvailable }}</h4>
              <p>Hours Available</p>
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
import { useCounsellorStats } from '@/composables/useCounsellorStats'


const { user } = useAuth()
const { practiceStats, loading, error, fetchCounsellorStats } = useCounsellorStats()



// Refresh stats manually
const handleRefreshStats = async () => {
  if (user.value?.uid) {
    await fetchCounsellorStats(user.value.uid)
    M.toast({ html: 'Statistics refreshed!', classes: 'blue' })
  }
}

onMounted(async () => {
  // Fetch real counsellor statistics
  if (user.value?.uid) {
    await fetchCounsellorStats(user.value.uid)
  }
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
