<template>
  <DashboardLayout
    :welcome-title="`Welcome back, ${user?.displayName}! 🌟`"
    welcome-message="Your mental health journey matters. Here's your personalized dashboard to help you thrive."
    theme="teal"
  >
    <!-- Quick Actions -->
    <div class="row">
      <div class="col s12">
        <h5>Quick Actions</h5>
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="Resources"
          description="Explore mental health articles and tools"
          icon="library_books"
          action-text="Browse"
          action-link="/resources"
        />
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="Book Session"
          description="Schedule with a counsellor"
          icon="event"
          action-text="Book"
          action-link="/book-appointment"
        />
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="My Sessions"
          description="View your appointments"
          icon="schedule"
          action-text="View"
          action-link="/my-appointments"
        />
      </div>
    </div>

    <!-- Personal Stats -->
    <div class="row">
      <div class="col s12">
        <h5>Your Progress</h5>
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="Sessions Completed"
          icon="check_circle"
          :stats="{ sessions: { value: userStats.sessionsCompleted, label: 'Completed' } }"
        />
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="Resources Viewed"
          icon="visibility"
          :stats="{ resources: { value: userStats.resourcesViewed, label: 'Viewed' } }"
        />
      </div>

      <div class="col s12 m6 l3">
        <DashboardCard
          title="Days Active"
          icon="calendar_today"
          :stats="{ days: { value: userStats.daysActive, label: 'Days' } }"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'

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
/* Minimal styles - most styling is handled by DashboardLayout and DashboardCard components */
</style>
