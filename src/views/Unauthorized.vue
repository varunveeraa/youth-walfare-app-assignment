<template>
  <div class="unauthorized center-content">
    <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="card-panel center-align">
            <i class="material-icons large red-text">block</i>
            <h4>Access Denied</h4>
            <p class="grey-text">
              You don't have permission to access this page. 
              Please contact an administrator if you believe this is an error.
            </p>
            <div class="actions">
              <router-link to="/" class="btn waves-effect waves-light teal">
                <i class="material-icons left">home</i>
                Go Home
              </router-link>
              <router-link to="/dashboard" class="btn waves-effect waves-light grey">
                <i class="material-icons left">dashboard</i>
                Dashboard
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unauthorized {
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
