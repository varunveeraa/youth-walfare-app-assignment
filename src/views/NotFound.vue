<template>
  <div class="not-found center-content">
    <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="card-panel center-align">
            <i class="material-icons large orange-text">error_outline</i>
            <h4>Page Not Found</h4>
            <p class="grey-text">
              The page you're looking for doesn't exist. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            <div class="actions">
              <router-link to="/" class="btn waves-effect waves-light teal">
                <i class="material-icons left">home</i>
                Go Home
              </router-link>
              <button @click="goBack" class="btn waves-effect waves-light grey">
                <i class="material-icons left">arrow_back</i>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
}

.material-icons.large {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.actions {
  margin-top: 2rem;
}

.actions .btn {
  margin: 0.5rem;
}
</style>
