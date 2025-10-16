<template>
  <div class="wellness-spaces-page">
    <!-- Header -->
    <div class="section teal lighten-5">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <h3 class="center-align teal-text text-darken-2">
              <i class="material-icons large">nature_people</i>
              Mind Bridging Spaces
            </h3>
            <p class="center-align grey-text text-darken-1 flow-text">
              Discover places that naturally support your mental wellness - parks, community spaces,
              and environments that passively improve your mental health and well-being
            </p>
            <div class="center-align">
              <span class="chip teal lighten-4">
                <i class="material-icons tiny">eco</i>
                Nature Therapy
              </span>
              <span class="chip teal lighten-4">
                <i class="material-icons tiny">groups</i>
                Community Connection
              </span>
              <span class="chip teal lighten-4">
                <i class="material-icons tiny">self_improvement</i>
                Mental Restoration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wellness Categories -->
    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <h4 class="center-align">Explore Wellness Spaces</h4>
            <p class="center-align grey-text">
              Choose a category to discover spaces that support your mental well-being
            </p>
          </div>
        </div>

        <div class="row">
          <div
            v-for="category in wellnessCategories"
            :key="category.key"
            class="col s12 m6 l4"
          >
            <div
              class="card hoverable wellness-category-card"
              @click="selectWellnessCategory(category)"
              :class="{ 'selected': selectedCategory?.key === category.key }"
            >
              <div class="card-content center-align">
                <i
                  class="material-icons large"
                  :style="{ color: category.color }"
                >
                  {{ category.icon }}
                </i>
                <h6>{{ category.name }}</h6>
                <p class="grey-text text-darken-1">{{ category.description }}</p>
                <div class="benefits-preview">
                  <small class="grey-text">
                    <i class="material-icons tiny">check_circle</i>
                    {{ category.benefits[0] }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left">explore</i>
                  Discover Wellness Spaces Near You
                </span>
                <p class="grey-text">
                  <template v-if="gettingLocation">
                    <i class="material-icons left">location_searching</i>
                    Getting your location for better results...
                  </template>
                  <template v-else-if="selectedCategory">
                    Showing {{ selectedCategory.name.toLowerCase() }} that support mental wellness
                  </template>
                  <template v-else>
                    Select a category above or search for specific wellness spaces
                  </template>
                </p>

                <!-- Debug Controls -->
                <div class="center-align" style="margin: 10px 0;">
                  <button @click="getUserLocation" class="btn-small blue" :disabled="gettingLocation">
                    <i class="material-icons left">my_location</i>
                    {{ gettingLocation ? 'Getting Location...' : 'Get My Location' }}
                  </button>
                  <button @click="testSearch" class="btn-small orange" style="margin-left: 10px;">
                    <i class="material-icons left">search</i>
                    Test Search (Parks)
                  </button>
                  <button @click="addTestMarkers" class="btn-small purple" style="margin-left: 10px;">
                    <i class="material-icons left">place</i>
                    Add Test Markers
                  </button>
                  <span v-if="userLocation" class="green-text" style="margin-left: 10px;">
                    <i class="material-icons tiny">check_circle</i>
                    Location: {{ userLocation[1].toFixed(4) }}, {{ userLocation[0].toFixed(4) }}
                  </span>
                </div>

                <!-- Map Component -->
                <MapComponent
                  :height="mapHeight"
                  :show-route-controls="false"
                  :initial-center="userLocation || defaultLocation"
                  :initial-zoom="userLocation ? 13 : 10"
                  @map-ready="onMapReady"
                  @location-found="onLocationFound"
                  @route-calculated="onRouteCalculated"
                  @map-click="onMapClick"
                  @search-error="onSearchError"
                  @route-error="onRouteError"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Category Details -->
    <div class="section grey lighten-4" v-if="selectedCategory">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-content">
                <span class="card-title">
                  <i class="material-icons left" :style="{ color: selectedCategory.color }">
                    {{ selectedCategory.icon }}
                  </i>
                  {{ selectedCategory.name }} - Mental Health Benefits
                </span>

                <div class="row">
                  <div class="col s12 m8">
                    <h6>How {{ selectedCategory.name }} Support Mental Wellness:</h6>
                    <ul class="collection">
                      <li
                        v-for="(benefit, index) in selectedCategory.benefits"
                        :key="index"
                        class="collection-item"
                      >
                        <i class="material-icons left green-text">check_circle</i>
                        {{ benefit }}
                      </li>
                    </ul>
                  </div>

                  <div class="col s12 m4">
                    <div class="card-panel teal lighten-5">
                      <h6 class="teal-text">
                        <i class="material-icons left">lightbulb</i>
                        Wellness Tips
                      </h6>
                      <div v-if="getWellnessTips(selectedCategory.key)">
                        <p
                          v-for="(tip, index) in getWellnessTips(selectedCategory.key).slice(0, 3)"
                          :key="index"
                          class="small-text"
                        >
                          <i class="material-icons tiny teal-text">fiber_manual_record</i>
                          {{ tip }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card-action">
                  <button
                    @click="findNearbyWellnessSpaces"
                    class="btn teal"
                    :disabled="loading"
                  >
                    <i class="material-icons left">search</i>
                    Find Nearby {{ selectedCategory.name }}
                  </button>
                  <button
                    @click="clearSelection"
                    class="btn-flat"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mental Wellness Insights -->
    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <h4 class="center-align">The Science of Wellness Spaces</h4>
            <p class="center-align grey-text">
              Understanding how different environments support mental health
            </p>
          </div>
        </div>

        <div class="row">
          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content center-align">
                <i class="material-icons large green-text">nature</i>
                <h6>Nature Therapy</h6>
                <p>Spending time in green spaces reduces cortisol levels, lowers blood pressure, and improves mood through natural stress relief.</p>
              </div>
            </div>
          </div>

          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content center-align">
                <i class="material-icons large blue-text">groups</i>
                <h6>Social Connection</h6>
                <p>Community spaces foster social bonds that are essential for mental health, reducing isolation and building support networks.</p>
              </div>
            </div>
          </div>

          <div class="col s12 m6 l4">
            <div class="card">
              <div class="card-content center-align">
                <i class="material-icons large orange-text">fitness_center</i>
                <h6>Physical Activity</h6>
                <p>Exercise releases endorphins and promotes neuroplasticity, naturally improving mood and cognitive function.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s12">
            <div class="card teal lighten-5">
              <div class="card-content">
                <span class="card-title teal-text">
                  <i class="material-icons left">psychology</i>
                  Mind Bridging Concept
                </span>
                <p>
                  Mind bridging spaces are environments that naturally connect your mental state to positive experiences.
                  These spaces don't require formal therapy or intervention - they passively support mental wellness through:
                </p>
                <div class="row">
                  <div class="col s12 m6">
                    <ul class="collection">
                      <li class="collection-item">
                        <i class="material-icons left teal-text">spa</i>
                        Natural stress reduction
                      </li>
                      <li class="collection-item">
                        <i class="material-icons left teal-text">favorite</i>
                        Mood enhancement
                      </li>
                      <li class="collection-item">
                        <i class="material-icons left teal-text">people</i>
                        Social connection opportunities
                      </li>
                    </ul>
                  </div>
                  <div class="col s12 m6">
                    <ul class="collection">
                      <li class="collection-item">
                        <i class="material-icons left teal-text">self_improvement</i>
                        Mindfulness promotion
                      </li>
                      <li class="collection-item">
                        <i class="material-icons left teal-text">energy_savings_leaf</i>
                        Environmental restoration
                      </li>
                      <li class="collection-item">
                        <i class="material-icons left teal-text">celebration</i>
                        Joy and play encouragement
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Searches -->
    <div class="section" v-if="recentSearches.length > 0">
      <div class="container">
        <div class="row">
          <div class="col s12">
            <h4>Recent Searches</h4>
            <div class="collection">
              <a
                v-for="(search, index) in recentSearches"
                :key="index"
                @click="goToLocation(search)"
                class="collection-item waves-effect"
              >
                <i class="material-icons left">history</i>
                {{ search.name }}
                <span class="secondary-content">
                  <i class="material-icons">chevron_right</i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <div id="toast-container"></div>

    <!-- Location Details Modal -->
    <div v-if="locationModal.show" class="modal-overlay" @click="closeLocationModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="material-icons left" :style="{ color: locationModal.location?.color }">
              {{ locationModal.location?.icon }}
            </i>
            {{ locationModal.location?.name }}
          </h4>
          <button @click="closeLocationModal" class="modal-close btn-flat">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <div class="row">
            <div class="col s12">
              <div class="card-panel" :style="{ borderLeft: `4px solid ${locationModal.location?.color}` }">
                <h6 class="category-title">
                  <i class="material-icons left">category</i>
                  {{ locationModal.location?.categoryName }}
                </h6>
                <p class="location-address">
                  <i class="material-icons left">place</i>
                  {{ locationModal.location?.address }}
                </p>
                <p class="coordinates-info">
                  <i class="material-icons left">my_location</i>
                  {{ locationModal.location?.coordinates?.[1]?.toFixed(4) }},
                  {{ locationModal.location?.coordinates?.[0]?.toFixed(4) }}
                </p>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col s12">
              <h6>
                <i class="material-icons left green-text">psychology</i>
                Mental Health Benefits
              </h6>
              <ul class="collection">
                <li
                  v-for="(benefit, index) in locationModal.location?.benefits?.slice(0, 4)"
                  :key="index"
                  class="collection-item"
                >
                  <i class="material-icons left green-text">check_circle</i>
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>

          <div class="row">
            <div class="col s12">
              <div class="card-panel teal lighten-5">
                <h6 class="teal-text">
                  <i class="material-icons left">lightbulb</i>
                  How This Space Supports Wellness
                </h6>
                <p>{{ locationModal.location?.description }}</p>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col s12">
              <h6>
                <i class="material-icons left blue-text">directions</i>
                Quick Actions
              </h6>
              <div class="action-buttons">
                <button
                  @click="getDirectionsToLocation"
                  class="btn blue waves-effect waves-light"
                >
                  <i class="material-icons left">directions</i>
                  Get Directions
                </button>
                <button
                  @click="shareLocationDetails"
                  class="btn green waves-effect waves-light"
                >
                  <i class="material-icons left">share</i>
                  Share Location
                </button>
                <button
                  @click="saveToFavorites"
                  class="btn orange waves-effect waves-light"
                >
                  <i class="material-icons left">favorite</i>
                  Save Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapComponent from '@/components/MapComponent.vue'
import { useAuth } from '@/composables/useAuth'
import { getAllWellnessCategories, wellnessTips } from '@/utils/wellnessSpaces'
import mapboxgl from 'mapbox-gl'

export default {
  name: 'WellnessSpaces',
  components: {
    MapComponent
  },
  setup() {
    const { user } = useAuth()
    return { user }
  },
  data() {
    return {
      map: null,
      userLocation: null,
      defaultLocation: [-74.006, 40.7128], // New York City fallback
      mapHeight: '500px',
      recentSearches: [],
      currentRoute: null,
      wellnessCategories: getAllWellnessCategories(),
      selectedCategory: null,
      foundWellnessSpaces: [],
      loading: false,
      locationModal: {
        show: false,
        location: null
      },
      gettingLocation: false
    }
  },
  mounted() {
    // Get user's location on component mount
    this.getUserLocation()
    this.loadRecentSearches()
    this.adjustMapHeight()
    window.addEventListener('resize', this.adjustMapHeight)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustMapHeight)
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
              maximumAge: 300000 // 5 minutes
            })
          })

          this.userLocation = [position.coords.longitude, position.coords.latitude]
          this.showToast('Location detected successfully', 'success')

          // Center map on user location if map is ready
          if (this.map) {
            this.map.flyTo({
              center: this.userLocation,
              zoom: 13
            })
          }

          // Get city name for user feedback
          this.getCityName(this.userLocation)

        } catch (error) {
          console.warn('Geolocation error:', error)
          this.showToast('Using default location. Enable location access for better results.', 'info')
          this.userLocation = this.defaultLocation
        } finally {
          this.gettingLocation = false
        }
      } else {
        this.showToast('Geolocation not supported. Using default location.', 'warning')
        this.userLocation = this.defaultLocation
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
            const cityName = data.features[0].place_name
            this.showToast(`Map centered on ${cityName}`, 'success')
          }
        }
      } catch (error) {
        console.warn('City name lookup failed:', error)
      }
    },

    onMapReady(map) {
      this.map = map
      console.log('Map is ready')

      // If we have user location, center the map on it
      if (this.userLocation) {
        map.flyTo({
          center: this.userLocation,
          zoom: 12
        })
      }
    },

    onLocationFound(location) {
      console.log('Location found:', location)
      this.addToRecentSearches(location)
      this.showToast(`Found: ${location.name}`, 'success')
    },

    onRouteCalculated(routeData) {
      console.log('Route calculated:', routeData)
      this.currentRoute = routeData
      this.showToast(
        `Route found: ${routeData.info.distance}, ${routeData.info.duration}`,
        'success'
      )
    },

    onMapClick(data) {
      console.log('Map clicked:', data)
      // You could add functionality here to show location details
    },

    onSearchError(error) {
      console.error('Search error:', error)
      this.showToast(error, 'error')
    },

    onRouteError(error) {
      console.error('Route error:', error)
      this.showToast(error, 'error')
    },



    selectWellnessCategory(category) {
      this.selectedCategory = category
      this.showToast(`Selected ${category.name} - searching for nearby locations...`, 'info')

      // Automatically search for nearby wellness spaces
      this.findNearbyWellnessSpaces()

      // Scroll to map section
      setTimeout(() => {
        const mapSection = document.querySelector('.card-title')
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    },

    clearSelection() {
      this.selectedCategory = null
      this.foundWellnessSpaces = []
      if (this.map) {
        // Clear any existing markers
        this.map.getSource('wellness-spaces') && this.map.removeSource('wellness-spaces')
        this.map.getLayer('wellness-spaces') && this.map.removeLayer('wellness-spaces')
      }
    },

    async findNearbyWellnessSpaces() {
      if (!this.selectedCategory) {
        this.showToast('Please select a wellness category first', 'warning')
        return
      }

      this.loading = true
      this.showToast(`Searching for nearby ${this.selectedCategory.name.toLowerCase()}...`, 'info')

      try {
        const searchTerms = this.selectedCategory.searchTerms
        const userCoords = this.userLocation || this.defaultLocation

        // Search for each term and combine results
        const allResults = []

        for (const term of searchTerms.slice(0, 2)) { // Limit to 2 terms to avoid rate limiting
          try {
            const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
              `proximity=${userCoords[0]},${userCoords[1]}&` +
              `access_token=${this.getMapboxToken()}&` +
              `limit=5&` +
              `types=poi`

            console.log(`Searching for "${term}" at:`, searchUrl)

            const response = await fetch(searchUrl)

            console.log(`Response for "${term}":`, {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
            })

            if (response.ok) {
              const data = await response.json()
              console.log(`Data for "${term}":`, data)

              if (data.features && data.features.length > 0) {
                allResults.push(...data.features)
                console.log(`Added ${data.features.length} results for "${term}"`)
              } else {
                console.log(`No features found for "${term}"`)
              }
            } else {
              console.error(`API error for "${term}":`, response.status, response.statusText)
              const errorText = await response.text()
              console.error('Error details:', errorText)
            }
          } catch (error) {
            console.error(`Search failed for term: ${term}`, error)
          }
        }

        // If no results with POI filter, try without it
        if (allResults.length === 0) {
          console.log('No POI results found, trying broader search...')

          for (const term of searchTerms.slice(0, 1)) { // Try just one term for broader search
            try {
              const broadSearchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
                `proximity=${userCoords[0]},${userCoords[1]}&` +
                `access_token=${this.getMapboxToken()}&` +
                `limit=10`

              console.log(`Broad search for "${term}" at:`, broadSearchUrl)

              const response = await fetch(broadSearchUrl)

              if (response.ok) {
                const data = await response.json()
                console.log(`Broad search data for "${term}":`, data)

                if (data.features && data.features.length > 0) {
                  allResults.push(...data.features)
                  console.log(`Added ${data.features.length} broad results for "${term}"`)
                }
              }
            } catch (error) {
              console.error(`Broad search failed for term: ${term}`, error)
            }
          }
        }

        // Remove duplicates and process results
        const uniqueResults = this.removeDuplicateLocations(allResults)
        this.foundWellnessSpaces = uniqueResults.slice(0, 10) // Limit to 10 results

        console.log('Final search results:', {
          searchTerms,
          userCoords,
          allResults: allResults.length,
          uniqueResults: uniqueResults.length,
          foundWellnessSpaces: this.foundWellnessSpaces.length,
          sampleResults: this.foundWellnessSpaces.slice(0, 3)
        })

        if (this.foundWellnessSpaces.length > 0) {
          this.displayWellnessSpacesOnMap()
          this.showToast(`Found ${this.foundWellnessSpaces.length} ${this.selectedCategory.name.toLowerCase()} nearby`, 'success')
        } else {
          this.showToast(`No ${this.selectedCategory.name.toLowerCase()} found nearby. Try a different area or category.`, 'warning')
        }

      } catch (error) {
        console.error('Error finding wellness spaces:', error)
        this.showToast('Error searching for wellness spaces', 'error')
      } finally {
        this.loading = false
      }
    },

    removeDuplicateLocations(locations) {
      const seen = new Set()
      return locations.filter(location => {
        const key = `${location.center[0].toFixed(4)},${location.center[1].toFixed(4)}`
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
    },

    displayWellnessSpacesOnMap() {
      console.log('displayWellnessSpacesOnMap called:', {
        mapExists: !!this.map,
        spacesCount: this.foundWellnessSpaces.length,
        spaces: this.foundWellnessSpaces
      })

      if (!this.map || !this.foundWellnessSpaces.length) {
        console.warn('Cannot display wellness spaces:', {
          mapExists: !!this.map,
          spacesCount: this.foundWellnessSpaces.length
        })
        return
      }

      // Remove existing wellness spaces layers
      if (this.map.getSource('wellness-spaces')) {
        this.map.removeLayer('wellness-spaces')
        this.map.removeSource('wellness-spaces')
      }
      if (this.map.getSource('wellness-spaces-symbols')) {
        this.map.removeLayer('wellness-spaces-symbols')
        this.map.removeSource('wellness-spaces-symbols')
      }

      // Create GeoJSON data for wellness spaces
      const geojsonData = {
        type: 'FeatureCollection',
        features: this.foundWellnessSpaces.map((space, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: space.center
          },
          properties: {
            id: index,
            name: space.place_name || space.text,
            address: space.properties?.address || space.place_name || '',
            category: this.selectedCategory.key,
            categoryName: this.selectedCategory.name,
            color: this.selectedCategory.color,
            icon: this.selectedCategory.icon,
            benefits: this.selectedCategory.benefits,
            description: this.selectedCategory.description,
            coordinates: space.center
          }
        }))
      }

      // Add source for circles
      this.map.addSource('wellness-spaces', {
        type: 'geojson',
        data: geojsonData
      })
      console.log('Added wellness-spaces source with data:', geojsonData)

      // Add circle layer for better visibility
      this.map.addLayer({
        id: 'wellness-spaces',
        type: 'circle',
        source: 'wellness-spaces',
        paint: {
          'circle-radius': 12,
          'circle-color': this.selectedCategory.color,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      })
      console.log('Added wellness-spaces circle layer')

      // Add symbol layer for icons
      this.map.addSource('wellness-spaces-symbols', {
        type: 'geojson',
        data: geojsonData
      })

      this.map.addLayer({
        id: 'wellness-spaces-symbols',
        type: 'symbol',
        source: 'wellness-spaces-symbols',
        layout: {
          'text-field': '📍',
          'text-size': 20,
          'text-anchor': 'center',
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      })

      // Add click events for wellness spaces
      this.map.on('click', 'wellness-spaces', (e) => {
        const feature = e.features[0]
        const spaceData = this.foundWellnessSpaces[feature.properties.id]

        this.showLocationModal({
          ...feature.properties,
          rawData: spaceData
        })
      })

      // Add click events for symbols too
      this.map.on('click', 'wellness-spaces-symbols', (e) => {
        const feature = e.features[0]
        const spaceData = this.foundWellnessSpaces[feature.properties.id]

        this.showLocationModal({
          ...feature.properties,
          rawData: spaceData
        })
      })

      // Change cursor on hover
      this.map.on('mouseenter', 'wellness-spaces', () => {
        this.map.getCanvas().style.cursor = 'pointer'
      })
      this.map.on('mouseleave', 'wellness-spaces', () => {
        this.map.getCanvas().style.cursor = ''
      })
      this.map.on('mouseenter', 'wellness-spaces-symbols', () => {
        this.map.getCanvas().style.cursor = 'pointer'
      })
      this.map.on('mouseleave', 'wellness-spaces-symbols', () => {
        this.map.getCanvas().style.cursor = ''
      })

      // Fit map to show all wellness spaces
      if (this.foundWellnessSpaces.length > 1) {
        const coordinates = this.foundWellnessSpaces.map(space => space.center)
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

        this.map.fitBounds(bounds, { padding: 50 })
      } else if (this.foundWellnessSpaces.length === 1) {
        this.map.flyTo({
          center: this.foundWellnessSpaces[0].center,
          zoom: 15
        })
      }
    },

    showLocationModal(location) {
      this.locationModal = {
        show: true,
        location: location
      }
    },

    closeLocationModal() {
      this.locationModal.show = false
      this.locationModal.location = null
    },

    getDirectionsToLocation() {
      if (!this.locationModal.location?.coordinates) return

      const coords = this.locationModal.location.coordinates
      const name = this.locationModal.location.name

      // Open in Google Maps for directions
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}&destination_place_id=${encodeURIComponent(name)}`
      window.open(googleMapsUrl, '_blank')

      this.showToast('Opening directions in Google Maps', 'info')
    },

    shareLocationDetails() {
      if (!this.locationModal.location) return

      const location = this.locationModal.location
      const coords = location.coordinates
      const shareText = `Check out this wellness space: ${location.name}\n` +
                       `Category: ${location.categoryName}\n` +
                       `Address: ${location.address}\n` +
                       `Coordinates: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}\n` +
                       `Mental Health Benefits: ${location.benefits?.[0] || 'Supports mental wellness'}`

      if (navigator.share) {
        navigator.share({
          title: `Wellness Space: ${location.name}`,
          text: shareText,
          url: window.location.href
        }).catch(console.error)
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          this.showToast('Location details copied to clipboard', 'success')
        }).catch(() => {
          // Fallback for older browsers
          const input = document.createElement('input')
          input.value = shareText
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
          this.showToast('Location details copied to clipboard', 'success')
        })
      }
    },

    saveToFavorites() {
      if (!this.locationModal.location) return

      const location = this.locationModal.location
      const favorites = JSON.parse(localStorage.getItem('wellnessFavorites') || '[]')

      // Check if already in favorites
      const exists = favorites.some(fav =>
        fav.coordinates[0] === location.coordinates[0] &&
        fav.coordinates[1] === location.coordinates[1]
      )

      if (exists) {
        this.showToast('Location already in favorites', 'warning')
        return
      }

      // Add to favorites
      favorites.push({
        name: location.name,
        address: location.address,
        coordinates: location.coordinates,
        category: location.categoryName,
        color: location.color,
        icon: location.icon,
        savedAt: new Date().toISOString()
      })

      localStorage.setItem('wellnessFavorites', JSON.stringify(favorites))
      this.showToast(`${location.name} saved to favorites`, 'success')
    },

    testSearch() {
      // Test search with parks category
      this.selectedCategory = this.wellnessCategories.parks
      this.findNearbyWellnessSpaces()
    },

    addTestMarkers() {
      // Add some test markers to verify map functionality
      this.selectedCategory = this.wellnessCategories.parks

      // Create test wellness spaces (famous parks around the world)
      this.foundWellnessSpaces = [
        {
          center: [-73.9665, 40.7812], // Central Park, NYC
          place_name: "Central Park, New York, NY, USA",
          properties: { address: "Central Park, New York, NY" }
        },
        {
          center: [-0.1657, 51.5074], // Hyde Park, London
          place_name: "Hyde Park, London, UK",
          properties: { address: "Hyde Park, London" }
        },
        {
          center: [2.2945, 48.8566], // Tuileries Garden, Paris
          place_name: "Tuileries Garden, Paris, France",
          properties: { address: "Tuileries Garden, Paris" }
        }
      ]

      console.log('Added test markers:', this.foundWellnessSpaces)
      this.displayWellnessSpacesOnMap()
      this.showToast('Added test wellness space markers', 'success')
    },

    getWellnessTips(categoryKey) {
      return wellnessTips[categoryKey] || wellnessTips.general
    },

    getMapboxToken() {
      // Use your actual Mapbox token from environment variable
      const token = import.meta.env.VITE_MAPBOX_TOKEN
      if (!token || token === 'your_mapbox_access_token_here') {
        console.warn('Mapbox token not configured. Please set VITE_MAPBOX_TOKEN in your .env file')
        return 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
      }
      return token
    },

    shareLocation() {
      if (this.userLocation) {
        const locationUrl = `https://maps.google.com/?q=${this.userLocation[1]},${this.userLocation[0]}`
        
        if (navigator.share) {
          navigator.share({
            title: 'My Current Location',
            text: 'Here is my current location',
            url: locationUrl
          }).then(() => {
            this.showToast('Location shared successfully', 'success')
          }).catch(() => {
            this.fallbackShare(locationUrl)
          })
        } else {
          this.fallbackShare(locationUrl)
        }
      } else {
        this.showToast('Location not available', 'error')
      }
    },

    fallbackShare(url) {
      // Fallback sharing method
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          this.showToast('Location URL copied to clipboard', 'success')
        })
      } else {
        // Create a temporary input element for older browsers
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        this.showToast('Location URL copied to clipboard', 'success')
      }
    },

    goToLocation(location) {
      if (this.map && location.coordinates) {
        this.map.flyTo({
          center: location.coordinates,
          zoom: 14
        })
      }
    },

    addToRecentSearches(location) {
      // Add to recent searches, avoiding duplicates
      const existing = this.recentSearches.findIndex(
        search => search.name === location.name
      )
      
      if (existing !== -1) {
        this.recentSearches.splice(existing, 1)
      }
      
      this.recentSearches.unshift(location)
      
      // Keep only last 5 searches
      if (this.recentSearches.length > 5) {
        this.recentSearches = this.recentSearches.slice(0, 5)
      }
      
      this.saveRecentSearches()
    },

    loadRecentSearches() {
      try {
        const saved = localStorage.getItem('recentLocationSearches')
        if (saved) {
          this.recentSearches = JSON.parse(saved)
        }
      } catch (error) {
        console.warn('Could not load recent searches:', error)
      }
    },

    saveRecentSearches() {
      try {
        localStorage.setItem(
          'recentLocationSearches',
          JSON.stringify(this.recentSearches)
        )
      } catch (error) {
        console.warn('Could not save recent searches:', error)
      }
    },

    adjustMapHeight() {
      // Adjust map height based on screen size
      const screenHeight = window.innerHeight
      if (screenHeight < 600) {
        this.mapHeight = '400px'
      } else if (screenHeight < 800) {
        this.mapHeight = '500px'
      } else {
        this.mapHeight = '600px'
      }
    },

    showToast(message, type = 'info') {
      // Use Materialize toast
      const colors = {
        success: 'green',
        error: 'red',
        warning: 'orange',
        info: 'blue'
      }
      
      if (window.M && window.M.toast) {
        window.M.toast({
          html: message,
          classes: colors[type] || 'blue',
          displayLength: 4000
        })
      } else {
        // Fallback for when Materialize is not available
        console.log(`${type.toUpperCase()}: ${message}`)
      }
    }
  }
}
</script>

<style scoped>
.wellness-spaces-page {
  min-height: 100vh;
}

.wellness-category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.wellness-category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.wellness-category-card.selected {
  border-color: #26a69a;
  background-color: #f0f9ff;
}

.benefits-preview {
  margin-top: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #26a69a;
}

.card.hoverable {
  transition: all 0.3s ease;
}

.card.hoverable:hover {
  transform: translateY(-3px);
}

.collection-item {
  cursor: pointer;
  border: none !important;
  padding: 12px 20px;
}

.collection-item:hover {
  background-color: #f5f5f5;
}

.material-icons.large {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.material-icons.tiny {
  font-size: 1rem;
  vertical-align: middle;
}

.card-action .btn {
  margin-right: 10px;
}

.chip {
  margin: 0 5px 5px 0;
}

.small-text {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.flow-text {
  font-size: 1.2rem;
  line-height: 1.5;
}

/* Wellness category specific colors */
.wellness-category-card .material-icons {
  transition: transform 0.3s ease;
}

.wellness-category-card:hover .material-icons {
  transform: scale(1.1);
}

/* Loading state */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .material-icons.large {
    font-size: 3rem;
  }

  h3 {
    font-size: 2rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  .flow-text {
    font-size: 1.1rem;
  }

  .wellness-category-card {
    margin-bottom: 15px;
  }

  .chip {
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .benefits-preview {
    margin-top: 8px;
    padding: 6px;
  }

  .small-text {
    font-size: 0.8rem;
  }
}

/* Animation for category selection */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.wellness-category-card.selected {
  animation: pulse 0.6s ease-in-out;
}

/* Custom scrollbar for better UX */
.collection {
  max-height: 300px;
  overflow-y: auto;
}

.collection::-webkit-scrollbar {
  width: 6px;
}

.collection::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.collection::-webkit-scrollbar-thumb {
  background: #26a69a;
  border-radius: 3px;
}

.collection::-webkit-scrollbar-thumb:hover {
  background: #00695c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 8px 8px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.modal-close {
  min-width: auto !important;
  padding: 8px !important;
  border-radius: 50%;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px 24px;
}

.category-title {
  color: #26a69a;
  margin-bottom: 8px;
  font-weight: 500;
}

.location-address {
  color: #666;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.coordinates-info {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.action-buttons .btn {
  flex: 1;
  min-width: 140px;
  margin: 0;
}

/* Modal Animation */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Modal */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
    max-height: 85vh;
  }

  .modal-header {
    padding: 16px 20px 12px;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 16px 20px 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    margin: 10px;
  }

  .modal-header {
    padding: 12px 16px 8px;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 12px 16px 16px;
  }
}

/* Enhanced pointer styles for map */
.mapboxgl-popup {
  max-width: 300px;
}

.mapboxgl-popup-content {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
