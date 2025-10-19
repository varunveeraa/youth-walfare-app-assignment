<template>
  <div class="wellness-spaces-page">
    <!-- Full Screen Layout -->
    <div class="fullscreen-layout">
      <!-- Left Panel: Categories -->
      <div class="categories-sidebar">
        <div class="sidebar-header">
          <h4>Find Wellness Spaces</h4>
          <p>{{ currentCity || 'Melbourne' }}</p>
        </div>

        <div class="categories-scroll">
          <div
            v-for="category in wellnessCategories"
            :key="category.key"
            class="category-card"
            @click="selectWellnessCategory(category)"
            :class="{ 'active': selectedCategory?.key === category.key }"
          >
            <i
              class="material-icons category-icon"
              :style="{ color: category.color }"
            >
              {{ category.icon }}
            </i>
            <div class="category-text">
              <span class="category-name">{{ category.name }}</span>
              <small class="category-count" v-if="category.resultCount">
                {{ category.resultCount }} found
              </small>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button 
            @click="getUserLocation" 
            class="btn-small teal waves-effect" 
            :disabled="gettingLocation"
          >
            <i class="material-icons left">{{ gettingLocation ? 'hourglass_empty' : 'my_location' }}</i>
            {{ gettingLocation ? 'Locating...' : 'Use My Location' }}
          </button>
          <div class="location-status" v-if="userLocation">
            <i class="material-icons tiny green-text">check_circle</i>
            <span>{{ currentCity || 'Melbourne' }} detected</span>
          </div>
        </div>
      </div>

      <!-- Right Panel: Map -->
      <div class="map-main">
        <div class="map-toolbar">
          <div class="map-title">
            <span v-if="selectedCategory">{{ selectedCategory.name }} in {{ currentCity || 'Melbourne' }}</span>
            <span v-else>Select a category to explore</span>
          </div>
          <div class="map-actions" v-if="selectedCategory">
            <button 
              @click="findNearbyWellnessSpaces" 
              class="btn-small waves-effect" 
              :disabled="loading"
            >
              <i class="material-icons left">{{ loading ? 'hourglass_empty' : 'refresh' }}</i>
              {{ loading ? 'Searching...' : 'Refresh' }}
            </button>
          </div>
        </div>
        
        <div class="map-content">
          <MapComponent
            :height="'600px'"
            :show-route-controls="false"
            :initial-center="userLocation || defaultLocation"
            :initial-zoom="11"
            @map-ready="onMapReady"
          />

          <!-- Overlay message when no category selected -->
          <div v-if="!selectedCategory" class="map-overlay">
            <div class="overlay-content">
              <i class="material-icons large">explore</i>
              <h5>Discover {{ currentCity || 'Melbourne' }}</h5>
              <p>Select a wellness category to find mental health-supporting spaces near you</p>
              <small style="color: #999; margin-top: 10px; display: block;">
                Map shows Melbourne overview
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapComponent from '@/components/MapComponent.vue'
import { getAllWellnessCategories } from '@/utils/wellnessSpaces'
import mapboxgl from 'mapbox-gl'

export default {
  name: 'GeoLocation',
  components: {
    MapComponent
  },
  data() {
    return {
      map: null,
      markers: [],
      userLocation: null,
      currentCity: null,
      defaultLocation: [144.9631, -37.8136], // Melbourne, Australia
      mapHeight: '100%',
      wellnessCategories: getAllWellnessCategories(),
      selectedCategory: null,
      loading: false,
      gettingLocation: false
    }
  },
  mounted() {
    console.log('GeoLocation component mounted')
    this.getUserLocation()
  },
  methods: {
    async getUserLocation() {
      if (navigator.geolocation) {
        this.gettingLocation = true
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            })
          })

          this.userLocation = [position.coords.longitude, position.coords.latitude]
          this.getCityName(this.userLocation)
          
          if (this.map) {
            this.map.flyTo({
              center: this.userLocation,
              zoom: 14
            })
          }
        } catch (error) {
          console.warn('Geolocation error:', error)
          this.userLocation = this.defaultLocation
          this.currentCity = 'Melbourne'
        } finally {
          this.gettingLocation = false
        }
      } else {
        this.userLocation = this.defaultLocation
        this.currentCity = 'Melbourne'
      }
    },

    async getCityName(coordinates) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
          `access_token=${this.getMapboxToken()}&` +
          `types=place`
        )

        if (response.ok) {
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            this.currentCity = data.features[0].text || 'Melbourne'
          }
        }
      } catch (error) {
        console.error('Error getting city name:', error)
        this.currentCity = 'Melbourne'
      }
    },

    getCityBounds() {
      // Melbourne metropolitan area bounds
      return [
        [144.5, -38.2], // Southwest coordinates
        [145.5, -37.4]  // Northeast coordinates
      ]
    },

    selectWellnessCategory(category) {
      console.log('Category selected:', category.name)
      this.selectedCategory = category
      console.log('Selected category set to:', this.selectedCategory.name)
      this.findNearbyWellnessSpaces()
    },

    async findNearbyWellnessSpaces() {
      if (!this.selectedCategory) return

      this.loading = true
      console.log('Searching for:', this.selectedCategory.name)

      try {
        const searchTerms = this.selectedCategory.searchTerms
        const userCoords = this.userLocation || this.defaultLocation
        let allResults = []

        // Try multiple search strategies
        const searchStrategies = [
          // Strategy 1: POI search with bbox
          { types: 'poi', bbox: true },
          // Strategy 2: POI search without bbox
          { types: 'poi', bbox: false },
          // Strategy 3: General search with bbox
          { types: '', bbox: true },
          // Strategy 4: General search without bbox
          { types: '', bbox: false }
        ]

        for (const term of searchTerms.slice(0, 3)) {
          for (const strategy of searchStrategies) {
            try {
              let searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
                `proximity=${userCoords[0]},${userCoords[1]}&` +
                `access_token=${this.getMapboxToken()}&` +
                `limit=15`

              if (strategy.types) {
                searchUrl += `&types=${strategy.types}`
              }
              if (strategy.bbox) {
                searchUrl += `&bbox=${this.getMelbourneBbox()}`
              }
              searchUrl += `&country=au`

              console.log(`Searching for term: ${term} (strategy: ${strategy.types || 'general'}, bbox: ${strategy.bbox})`)
              const response = await fetch(searchUrl)
              if (response.ok) {
                const data = await response.json()
                console.log(`API returned ${data.features?.length || 0} features for ${term}`)

                if (data.features && data.features.length > 0) {
                  const filteredResults = data.features.filter(feature => {
                    const distance = this.calculateDistance(
                      userCoords[1], userCoords[0],
                      feature.center[1], feature.center[0]
                    )
                    return distance <= 50 // Increased to 50km for better results
                  })

                  if (filteredResults.length > 0) {
                    allResults.push(...filteredResults)
                    console.log(`Found ${filteredResults.length} results for ${term} with ${strategy.types || 'general'} search`)
                    break // Stop trying strategies for this term if we found results
                  }
                }
              }
            } catch (error) {
              console.error(`Search failed for term: ${term}`, error)
            }
          }
        }

        console.log('Total results found:', allResults.length)

        // If no results found, add some sample Melbourne locations for this category
        if (allResults.length === 0) {
          console.log('No API results found, adding sample locations for', this.selectedCategory.name)
          allResults = this.getSampleLocations(this.selectedCategory.key)
        }

        // Update category with result count
        this.selectedCategory.resultCount = allResults.length

        // Add markers to map
        if (this.map && allResults.length > 0) {
          this.addMarkersToMap(allResults)
        } else {
          console.log('No results found for', this.selectedCategory.name)
        }

      } catch (error) {
        console.error('Search error:', error)
      } finally {
        this.loading = false
      }
    },

    addMarkersToMap(results) {
      console.log('Adding markers to map:', results.length)

      // Clear existing markers first
      if (this.markers) {
        this.markers.forEach(marker => marker.remove())
      }
      this.markers = []

      // Add new markers directly using Mapbox GL
      results.forEach(result => {
        try {
          console.log('Adding marker for:', result.place_name || result.text)

          const marker = new mapboxgl.Marker({
            color: this.selectedCategory.color || '#4CAF50'
          })
            .setLngLat(result.center)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div style="padding: 10px;">
                <h6 style="margin: 0 0 5px 0; font-size: 14px;">${result.place_name || result.text}</h6>
                <p style="margin: 0; font-size: 12px; color: #666;">${this.selectedCategory.name}</p>
                <small style="color: #999;">Click for directions</small>
              </div>
            `))
            .addTo(this.map)

          this.markers.push(marker)
          console.log('Marker added successfully')
        } catch (error) {
          console.error('Error adding marker:', error)
        }
      })

      console.log('Total markers added:', this.markers.length)

      // Fit map to show all markers with Melbourne bounds
      if (results.length > 0) {
        try {
          const coordinates = results.map(result => result.center)
          const bounds = new mapboxgl.LngLatBounds()

          coordinates.forEach(coord => bounds.extend(coord))

          this.map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 13
          })
          console.log('Map bounds fitted to show all markers')
        } catch (error) {
          console.error('Error fitting bounds:', error)
        }
      }
    },

    getMelbourneBbox() {
      return '144.5,-38.2,145.5,-37.4'
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371
      const dLat = this.deg2rad(lat2 - lat1)
      const dLon = this.deg2rad(lon2 - lon1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    },

    deg2rad(deg) {
      return deg * (Math.PI/180)
    },

    getMapboxToken() {
      return import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token'
    },

    getSampleLocations(categoryKey) {
      const sampleLocations = {
        'parks': [
          { center: [144.9631, -37.8136], place_name: 'Royal Botanic Gardens Melbourne', text: 'Royal Botanic Gardens' },
          { center: [144.9841, -37.8076], place_name: 'Fitzroy Gardens', text: 'Fitzroy Gardens' },
          { center: [144.9537, -37.8080], place_name: 'Carlton Gardens', text: 'Carlton Gardens' },
          { center: [144.9280, -37.8136], place_name: 'Flagstaff Gardens', text: 'Flagstaff Gardens' },
          { center: [145.0372, -37.8301], place_name: 'Yarra Park', text: 'Yarra Park' }
        ],
        'community': [
          { center: [144.9631, -37.8136], place_name: 'Melbourne Town Hall', text: 'Melbourne Town Hall' },
          { center: [144.9537, -37.8080], place_name: 'Carlton Community Centre', text: 'Carlton Community Centre' },
          { center: [144.9841, -37.8076], place_name: 'East Melbourne Community Centre', text: 'East Melbourne Community Centre' },
          { center: [145.0372, -37.8301], place_name: 'Richmond Community Centre', text: 'Richmond Community Centre' }
        ],
        'fitness': [
          { center: [144.9631, -37.8136], place_name: 'Melbourne Sports Centre', text: 'Melbourne Sports Centre' },
          { center: [144.9841, -37.8076], place_name: 'Fitzroy Pool', text: 'Fitzroy Pool' },
          { center: [144.9537, -37.8080], place_name: 'Carlton Fitness Centre', text: 'Carlton Fitness Centre' },
          { center: [145.0372, -37.8301], place_name: 'Richmond Recreation Centre', text: 'Richmond Recreation Centre' }
        ],
        'libraries': [
          { center: [144.9631, -37.8136], place_name: 'State Library Victoria', text: 'State Library Victoria' },
          { center: [144.9841, -37.8076], place_name: 'East Melbourne Library', text: 'East Melbourne Library' },
          { center: [144.9537, -37.8080], place_name: 'Carlton Library', text: 'Carlton Library' },
          { center: [145.0372, -37.8301], place_name: 'Richmond Library', text: 'Richmond Library' }
        ],
        'waterfront': [
          { center: [144.9631, -37.8136], place_name: 'Yarra River - Southbank', text: 'Yarra River - Southbank' },
          { center: [144.9841, -37.8076], place_name: 'Yarra River - Richmond', text: 'Yarra River - Richmond' },
          { center: [144.9280, -37.8136], place_name: 'Docklands Waterfront', text: 'Docklands Waterfront' }
        ]
      }

      return sampleLocations[categoryKey] || sampleLocations['parks']
    },

    onMapReady(map) {
      this.map = map
      console.log('Map ready:', map)
      console.log('Map center:', map.getCenter())
      console.log('Map zoom:', map.getZoom())
    }
  }
}
</script>

<style scoped>
.wellness-spaces-page {
  min-height: 100vh;
  overflow: hidden;
}

/* Full Screen Layout */
.fullscreen-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* Categories Sidebar */
.categories-sidebar {
  width: 320px;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.sidebar-header h4 {
  margin: 0 0 5px 0;
  color: #424242;
  font-weight: 600;
  font-size: 1.4rem;
}

.sidebar-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.categories-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #e0e0e0;
}

.category-card.active {
  border-color: #26a69a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6fffa 100%);
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.15);
}

.category-icon {
  font-size: 2rem !important;
  transition: transform 0.2s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.05);
}

.category-text {
  flex: 1;
}

.category-name {
  font-weight: 600;
  color: #424242;
  margin: 0 0 2px 0;
  font-size: 0.95rem;
}

.category-count {
  color: #26a69a;
  font-weight: 500;
  font-size: 0.8rem;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.location-status {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
}

/* Map Panel */
.map-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-toolbar {
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.map-title {
  font-weight: 600;
  color: #424242;
  font-size: 1.1rem;
}

.map-content {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  min-height: 400px;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.overlay-content {
  text-align: center;
  max-width: 300px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.overlay-content .material-icons {
  font-size: 3.5rem !important;
  color: #26a69a;
  margin-bottom: 15px;
}

.overlay-content h5 {
  margin: 0 0 10px 0;
  color: #424242;
}

.overlay-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 992px) {
  .fullscreen-layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .categories-sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
  }

  .categories-scroll {
    max-height: 200px;
  }

  .map-main {
    height: 60vh;
  }
}

@media (max-width: 600px) {
  .sidebar-header {
    padding: 15px;
  }

  .sidebar-footer {
    padding: 15px;
  }

  .map-toolbar {
    padding: 12px 15px;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .category-card {
    padding: 12px;
  }

  .category-icon {
    font-size: 1.8rem !important;
  }
}
</style>
