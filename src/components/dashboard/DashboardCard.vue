<template>
  <div class="card hoverable">
    <div class="card-content center-align">
      <i class="material-icons large" :class="iconColor">{{ icon }}</i>
      <span class="card-title">{{ title }}</span>
      <p v-if="description">{{ description }}</p>
      
      <!-- Stats display -->
      <div v-if="stats" class="stats-container">
        <div v-for="(stat, key) in stats" :key="key" class="stat-item">
          <h5 class="stat-value">{{ stat.value }}</h5>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
      
      <!-- Custom content slot -->
      <slot />
    </div>
    
    <!-- Action buttons -->
    <div v-if="actionText || $slots.actions" class="card-action center-align">
      <slot name="actions">
        <router-link
          v-if="actionLink"
          :to="actionLink"
          :class="`btn waves-effect waves-light ${actionColor}`"
        >
          {{ actionText }}
        </router-link>
        <button
          v-else-if="actionText"
          @click="$emit('action')"
          :class="`btn waves-effect waves-light ${actionColor}`"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  icon: { type: String, required: true },
  iconColor: { type: String, default: 'teal-text' },
  stats: { type: Object, default: null },
  actionText: { type: String, default: null },
  actionLink: { type: String, default: null },
  actionColor: { type: String, default: 'teal' }
})

defineEmits(['action'])
</script>

<style scoped>
.card {
  height: 100%;
}

.card:hover {
  box-shadow: 0 8px 17px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  transition: box-shadow 0.3s ease;
}

.material-icons.large {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  margin: 0;
  font-weight: bold;
  color: #26a69a;
}

.stat-label {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}
</style>
