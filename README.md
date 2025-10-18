# MindBridge Wellness Platform

An innovative mental health support ecosystem developed with Vue 3, integrating therapeutic session management, wellness resource discovery, and location-based healing spaces.

## Core Capabilities

### 🌿 Wellness Space Discovery System
- **Therapeutic Environment Mapping**: Locate parks, community hubs, fitness centers, and healing spaces that naturally enhance mental wellbeing
- **Dynamic Location Interface**: Mapbox-powered interactive mapping with categorized wellness destinations
- **Wellbeing Benefits Education**: Discover how different environments passively contribute to mental health restoration
- **Comprehensive Location Categories**: 10 distinct categories including green spaces, recreational areas, community centers, fitness venues, libraries, waterfront locations, walking paths, gardens, cultural spaces, and meditation centers
- **Proximity-Based Wellness**: Identify nearby therapeutic environments that complement your mental health journey
- **Environment-Specific Guidance**: Receive tailored recommendations for maximizing the therapeutic potential of each space
- **Environmental Psychology Integration**: Learn how physical spaces naturally facilitate positive mental state transitions

### 🎯 Comprehensive Mental Health Ecosystem
- Multi-tier user access control (Students, Therapists, Administrators)
- Therapeutic session scheduling and coordination
- Professional therapist directory with feedback systems
- Curated wellness resource library
- Automated communication systems

## Development Environment

### Preferred IDE Configuration
[Visual Studio Code](https://code.visualstudio.com/) with [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (ensure Vetur is disabled for optimal performance).

### Browser Development Tools
- **Chromium-based browsers** (Chrome, Edge, Brave):
  - [Vue.js devtools extension](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Enable Custom Object Formatter](http://bit.ly/object-formatters) in DevTools
- **Firefox**:
  - [Vue.js devtools add-on](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Activate Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/) in DevTools

## Build Configuration

Refer to [Vite Configuration Documentation](https://vite.dev/config/) for advanced customization options.

## Installation & Setup

### Environment Variables Setup

1. Create environment configuration:
```bash
cp .env.example .env
```

2. Add your Mapbox access token to `.env`:
```env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoidmFydW52ZWVyYSIsImEiOiJjbWd0MTF6NTMzYnRpMm1vdmIxZjJhdm5mIn0.pYqPUJv1_U7db2OnHMdYPQ
```

✅ **Integration Status**: Mapbox token is active and configured! The wellness location discovery feature utilizes real geographic data from Mapbox's extensive location database.

### Dependency Installation

```bash
npm install
```

### Development Server Launch

```bash
npm run serve
```

### Production Build Generation

```bash
npm run build
```

## Platform Usage Guide

### Wellness Space Discovery Navigation

1. Access `/location` route or select "Wellness Spaces" from the main navigation
2. Explore 10 therapeutic environment categories (nature areas, fitness facilities, community hubs, etc.)
3. Study the mental health benefits associated with each environment type
4. Utilize "Find Nearby" functionality to locate wellness spaces in your vicinity
5. Access comprehensive information about how each location supports psychological wellbeing
6. Receive environment-specific recommendations for optimizing therapeutic benefits

### Therapeutic Environment Categories

- **Nature & Green Areas**: Environmental therapy and stress mitigation
- **Recreation & Play Spaces**: Social engagement and emotional uplift
- **Community Gathering Places**: Belonging cultivation and peer support
- **Fitness & Movement Centers**: Endorphin activation and self-efficacy building
- **Learning & Quiet Spaces**: Contemplative practice and personal development
- **Waterfront & Coastal Areas**: Natural serenity and mindfulness cultivation
- **Pathways & Trail Systems**: Meditative movement and nature immersion
- **Gardening & Growing Spaces**: Horticultural therapy and community connection
- **Creative & Cultural Venues**: Artistic expression and inspiration
- **Contemplative & Sacred Spaces**: Inner tranquility and spiritual reflection

## Technical Architecture

- **Client-Side Framework**: Vue 3, Vue Router, Materialize CSS
- **Mapping Services**: Mapbox GL JS, Mapbox Geocoding API, Mapbox Directions API
- **Backend Infrastructure**: Firebase (Firestore, Authentication, Cloud Functions)
- **Development Tooling**: Vite
- **Hosting Platform**: Firebase Hosting
