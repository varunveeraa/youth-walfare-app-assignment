# Youth Welfare Web Application

A comprehensive mental health support platform built with Vue 3, featuring counsellor booking, resource management, and location services.

## Features

### 🗺️ Mind Bridging Wellness Spaces (BR E.2)
- **Wellness Space Discovery**: Find parks, community centers, gyms, and other spaces that naturally support mental health
- **Interactive Wellness Map**: Powered by Mapbox with categorized wellness locations
- **Mental Health Benefits**: Learn how different spaces passively improve mental wellness
- **10 Wellness Categories**: Parks, playgrounds, community centers, fitness facilities, libraries, waterfront areas, trails, gardens, arts spaces, and spiritual centers
- **Location-Based Wellness**: Discover nearby spaces that support your mental health journey
- **Wellness Tips**: Get specific guidance on how to use each space for mental restoration
- **Mind Bridging Concept**: Understand how environments naturally connect you to positive mental states

### 🧠 Mental Health Platform
- User role management (Youth, Counsellor, Admin)
- Appointment booking and management
- Counsellor directory and ratings
- Resource management
- Email notifications

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

### Environment Configuration

1. Copy the environment example file:
```sh
cp .env.example .env
```

2. Configure your Mapbox token in `.env`:
```env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoidmFydW52ZWVyYSIsImEiOiJjbWd0MTF6NTMzYnRpMm1vdmIxZjJhdm5mIn0.pYqPUJv1_U7db2OnHMdYPQ
```

✅ **Token Status**: Your Mapbox token is properly configured and active! The wellness spaces feature now uses real location data from Mapbox's comprehensive database.

### Install Dependencies

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Usage

### Accessing Mind Bridging Wellness Spaces

1. Navigate to `/location` or click "Wellness Spaces" in the navigation menu
2. Choose from 10 wellness categories (parks, gyms, community centers, etc.)
3. Learn about the mental health benefits of each space type
4. Click "Find Nearby" to discover wellness spaces in your area
5. View detailed information about how each space supports mental wellness
6. Get specific wellness tips for making the most of each environment

### Wellness Categories

- **Parks & Green Spaces**: Nature therapy and stress reduction
- **Playgrounds & Recreation**: Social connection and joy
- **Community Centers**: Belonging and support networks
- **Gyms & Fitness Centers**: Endorphin release and confidence building
- **Libraries & Learning Spaces**: Quiet reflection and personal growth
- **Waterfront & Beaches**: Natural tranquility and mindfulness
- **Walking Trails & Paths**: Mindful movement and nature connection
- **Community Gardens**: Therapeutic gardening and community building
- **Arts & Cultural Spaces**: Creative expression and inspiration
- **Spiritual & Meditation Spaces**: Inner peace and self-reflection

## Technology Stack

- **Frontend**: Vue 3, Vue Router, Materialize CSS
- **Maps**: Mapbox GL JS, Mapbox Geocoding API, Mapbox Directions API
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting
