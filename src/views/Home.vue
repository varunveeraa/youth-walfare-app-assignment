<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero teal darken-1 white-text">
      <div class="container">
        <div class="row">
          <div class="col s12 center-align">
            <h1 class="hero-title">Welcome to MindBridge</h1>
            <h5 class="hero-subtitle">Your Mental Health Journey Starts Here</h5>
            <p class="hero-description">
              Connect with professional counsellors, access mental health resources, 
              and join a supportive community designed specifically for young people.
            </p>
            <div class="hero-actions">
              <router-link 
                v-if="!isAuthenticated" 
                to="/register" 
                class="btn-large waves-effect waves-light white teal-text"
              >
                Get Started
              </router-link>
              <router-link 
                v-else 
                to="/dashboard" 
                class="btn-large waves-effect waves-light white teal-text"
              >
                Go to Dashboard
              </router-link>
              <a href="#features" class="btn-large waves-effect waves-light teal darken-3 ml-2">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features section">
      <div class="container">
        <div class="row">
          <div class="col s12 center-align">
            <h3>How MindBridge Helps</h3>
            <p class="section-description">
              We provide comprehensive mental health support tailored for young people
            </p>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12 m4">
            <div class="card feature-card">
              <div class="card-content center-align">
                <i class="material-icons large teal-text">psychology</i>
                <h5>Professional Counselling</h5>
                <p>
                  Connect with licensed mental health professionals who specialize 
                  in youth counselling and understand your unique challenges.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col s12 m4">
            <div class="card feature-card">
              <div class="card-content center-align">
                <i class="material-icons large teal-text">groups</i>
                <h5>Supportive Community</h5>
                <p>
                  Join a safe, moderated community where you can share experiences, 
                  get support, and help others on their mental health journey.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col s12 m4">
            <div class="card feature-card">
              <div class="card-content center-align">
                <i class="material-icons large teal-text">library_books</i>
                <h5>Mental Health Resources</h5>
                <p>
                  Access a curated library of articles, tools, and resources 
                  designed to help you understand and manage your mental health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="stats grey lighten-4">
      <div class="container">
        <div class="row">
          <div class="col s12 center-align">
            <h4>Making a Difference</h4>
          </div>
        </div>
        <div class="row">
          <div class="col s12 m3 center-align">
            <h3 class="teal-text">1000+</h3>
            <p>Young People Supported</p>
          </div>
          <div class="col s12 m3 center-align">
            <h3 class="teal-text">50+</h3>
            <p>Licensed Counsellors</p>
          </div>
          <div class="col s12 m3 center-align">
            <h3 class="teal-text">24/7</h3>
            <p>Community Support</p>
          </div>
          <div class="col s12 m3 center-align">
            <h3 class="teal-text">95%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta teal darken-2 white-text">
      <div class="container">
        <div class="row">
          <div class="col s12 center-align">
            <h4>Ready to Start Your Journey?</h4>
            <p>Join thousands of young people who have found support and healing through MindBridge.</p>
            <router-link 
              v-if="!isAuthenticated" 
              to="/register" 
              class="btn-large waves-effect waves-light white teal-text"
            >
              Sign Up Today
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<style scoped>
.hero {
  padding: 80px 0;
  background: linear-gradient(135deg, #26a69a 0%, #00695c 100%);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-weight: 300;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-top: 2rem;
}

.section {
  padding: 60px 0;
}

.section-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 3rem;
}

.feature-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.stats {
  padding: 60px 0;
}

.stats h3 {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.cta {
  padding: 60px 0;
}

.ml-2 {
  margin-left: 1rem;
}

@media only screen and (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions .btn-large {
    display: block;
    margin: 0.5rem auto;
    width: 200px;
  }
  
  .ml-2 {
    margin-left: 0;
  }
}
</style>
