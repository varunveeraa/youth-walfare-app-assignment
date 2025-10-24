<template>
  <div class="map-container">
    <div ref="mapContainer" class="map" :style="{ height: height }"></div>
    
    <!-- Search Box -->
    <div class="search-container">
      <div class="input-field">
        <input
          v-model="searchQuery"
          @keyup.enter="searchLocation"
          type="text"
          id="location-search"
          placeholder="Search for wellness spaces..."
          class="validate"
        >
        <label for="location-search">Search Wellness Spaces</label>
        <button @click="searchLocation" class="btn-small search-btn teal">
          <i class="material-icons">search</i>
        </button>
      </div>
    </div>

    <!-- Route Controls -->
    <div class="route-controls" v-if="showRouteControls">
      <div class="card">
        <div class="card-content">
          <span class="card-title">Route Planning</span>
          <div class="input-field">
            <input
              v-model="startLocation"
              type="text"
              id="start-location"
              placeholder="Starting point..."
            >
            <label for="start-location">From</label>
          </div>
          <div class="input-field">
            <input
              v-model="endLocation"
              type="text"
              id="end-location"
              placeholder="Destination..."
            >
            <label for="end-location">To</label>
          </div>
          <div class="route-buttons">
            <button @click="calculateRoute" class="btn blue">Get Directions</button>
            <button @click="clearRoute" class="btn red lighten-1">Clear Route</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Information -->
    <div class="route-info" v-if="routeInfo">
      <div class="card">
        <div class="card-content">
          <span class="card-title">Route Information</span>
          <p><strong>Distance:</strong> {{ routeInfo.distance }}</p>
          <p><strong>Duration:</strong> {{ routeInfo.duration }}</p>
          <div class="directions" v-if="routeInfo.steps">
            <h6>Turn-by-turn directions:</h6>
            <ol>
              <li v-for="(step, index) in routeInfo.steps" :key="index">
                {{ step.instruction }}
                <small class="grey-text">({{ step.distance }})</small>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div class="loading" v-if="loading">
      <div class="preloader-wrapper small active">
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
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default {
  name: 'MapComponent',
  props: {
    height: {
      type: String,
      default: '500px'
    },
    showRouteControls: {
      type: Boolean,
      default: true
    },
    initialCenter: {
      type: Array,
      default: () => [-74.006, 40.7128] // New York City
    },
    initialZoom: {
      type: Number,
      default: 12
    }
  },
  data() {
    return {
      map: null,
      searchQuery: '',
      startLocation: '',
      endLocation: '',
      routeInfo: null,
      loading: false,
      markers: [],
      routeLayer: null,
      // Use your actual Mapbox token from environment variable
      mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    }
  },
  mounted() {
    this.initializeMap()
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    initializeMap() {
      // Set Mapbox access token
      mapboxgl.accessToken = this.mapboxToken

      // Initialize map
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.initialCenter,
        zoom: this.initialZoom
      })

      // Add navigation controls
      this.map.addControl(new mapboxgl.NavigationControl())

      // Add geolocate control
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        })
      )

      // Add click event for adding markers
      this.map.on('click', this.onMapClick)

      this.$emit('map-ready', this.map)
    },

    async searchLocation() {
      if (!this.searchQuery.trim()) return

      this.loading = true
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            this.searchQuery
          )}.json?access_token=${mapboxgl.accessToken}&limit=1`
        )
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          const [lng, lat] = feature.center
          
          // Fly to location
          this.map.flyTo({
            center: [lng, lat],
            zoom: 14
          })
          
          // Add marker
          this.addMarker([lng, lat], feature.place_name)
          
          this.$emit('location-found', {
            coordinates: [lng, lat],
            name: feature.place_name
          })
        } else {
          this.$emit('search-error', 'Location not found')
        }
      } catch (error) {
        console.error('Search error:', error)
        this.$emit('search-error', 'Error searching location')
      } finally {
        this.loading = false
      }
    },

    async calculateRoute() {
      if (!this.startLocation.trim() || !this.endLocation.trim()) {
        this.$emit('route-error', 'Please enter both start and end locations')
        return
      }

      this.loading = true
      try {
        // Geocode start and end locations
        const [startCoords, endCoords] = await Promise.all([
          this.geocodeLocation(this.startLocation),
          this.geocodeLocation(this.endLocation)
        ])

        if (!startCoords || !endCoords) {
          this.$emit('route-error', 'Could not find one or both locations')
          return
        }

        // Get route from Mapbox Directions API
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        )

        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          
          // Display route on map
          this.displayRoute(route.geometry)
          
          // Add markers for start and end
          this.clearMarkers()
          this.addMarker(startCoords, this.startLocation, 'green')
          this.addMarker(endCoords, this.endLocation, 'red')
          
          // Fit map to route
          const coordinates = route.geometry.coordinates
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord)
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
          
          this.map.fitBounds(bounds, { padding: 50 })
          
          // Process route information
          this.routeInfo = {
            distance: `${(route.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(route.duration / 60)} minutes`,
            steps: route.legs[0].steps.map(step => ({
              instruction: step.maneuver.instruction,
              distance: `${(step.distance / 1000).toFixed(1)} km`
            }))
          }
          
          this.$emit('route-calculated', {
            route: route,
            info: this.routeInfo
          })
        }
      } catch (error) {
        console.error('Route calculation error:', error)
        this.$emit('route-error', 'Error calculating route')
      } finally {
        this.loading = false
      }
    },

    async geocodeLocation(location) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            location
          )}.json?access_token=${mapboxgl.accessToken}&limit=1`
        )
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          return data.features[0].center
        }
        return null
      } catch (error) {
        console.error('Geocoding error:', error)
        return null
      }
    },

    displayRoute(geometry) {
      // Remove existing route layer
      if (this.routeLayer && this.map.getLayer('route')) {
        this.map.removeLayer('route')
        this.map.removeSource('route')
      }

      // Add route source and layer
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: geometry
        }
      })

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      })

      this.routeLayer = 'route'
    },

    addMarker(coordinates, title = '', color = 'blue') {
      const marker = new mapboxgl.Marker({ color })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h6>${title}</h6>`))
        .addTo(this.map)
      
      this.markers.push(marker)
      return marker
    },

    clearMarkers() {
      this.markers.forEach(marker => marker.remove())
      this.markers = []
    },

    clearRoute() {
      if (this.routeLayer && this.map.getLayer('route')) {
        this.map.removeLayer('route')
        this.map.removeSource('route')
      }
      this.routeLayer = null
      this.routeInfo = null
      this.clearMarkers()
      this.startLocation = ''
      this.endLocation = ''
    },

    onMapClick(e) {
      const { lng, lat } = e.lngLat
      this.$emit('map-click', { coordinates: [lng, lat], event: e })
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
}

.map {
  width: 100%;
  border-radius: 8px;
}

.search-container {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-container .input-field {
  margin: 0;
  position: relative;
}

.search-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}

.route-controls {
  position: absolute;
  top: 80px;
  left: 10px;
  width: 300px;
  z-index: 1000;
}

.route-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 350px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.route-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.route-buttons .btn {
  flex: 1;
}

.directions {
  margin-top: 15px;
}

.directions ol {
  padding-left: 20px;
}

.directions li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .route-controls,
  .route-info {
    position: relative;
    width: 100%;
    margin-top: 10px;
  }
  
  .search-container {
    position: relative;
    margin-bottom: 10px;
  }
}
</style>
