/**
 * Utility functions for testing map functionality
 */

/**
 * Test if Mapbox GL is properly loaded
 */
export function testMapboxGL() {
  try {
    const mapboxgl = require('mapbox-gl')
    console.log('✅ Mapbox GL loaded successfully')
    return true
  } catch (error) {
    console.error('❌ Mapbox GL failed to load:', error)
    return false
  }
}

/**
 * Test geocoding functionality
 */
export async function testGeocoding(query = 'New York') {
  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      console.log('✅ Geocoding test successful:', data.features[0].place_name)
      return data.features[0]
    } else {
      console.warn('⚠️ No results found for query:', query)
      return null
    }
  } catch (error) {
    console.error('❌ Geocoding test failed:', error)
    return null
  }
}

/**
 * Test directions functionality
 */
export async function testDirections(start = [-74.006, 40.7128], end = [-73.935242, 40.730610]) {
  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${token}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      console.log('✅ Directions test successful:', {
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} minutes`
      })
      return route
    } else {
      console.warn('⚠️ No route found')
      return null
    }
  } catch (error) {
    console.error('❌ Directions test failed:', error)
    return null
  }
}

/**
 * Test geolocation API
 */
export function testGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported by this browser')
      resolve(null)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation test successful:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        resolve(position.coords)
      },
      (error) => {
        console.warn('⚠️ Geolocation test failed:', error.message)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  })
}

/**
 * Run all map tests
 */
export async function runAllMapTests() {
  console.log('🧪 Running map functionality tests...')
  
  const results = {
    mapboxGL: testMapboxGL(),
    geocoding: await testGeocoding('London'),
    directions: await testDirections(),
    geolocation: await testGeolocation()
  }
  
  console.log('📊 Test Results:', results)
  
  const passedTests = Object.values(results).filter(result => result !== null && result !== false).length
  const totalTests = Object.keys(results).length
  
  console.log(`✨ Tests completed: ${passedTests}/${totalTests} passed`)
  
  return results
}

/**
 * Sample locations for testing
 */
export const sampleLocations = [
  {
    name: 'New York City',
    coordinates: [-74.006, 40.7128],
    description: 'The Big Apple'
  },
  {
    name: 'London',
    coordinates: [-0.1276, 51.5074],
    description: 'Capital of England'
  },
  {
    name: 'Tokyo',
    coordinates: [139.6917, 35.6895],
    description: 'Capital of Japan'
  },
  {
    name: 'Sydney',
    coordinates: [151.2093, -33.8688],
    description: 'Harbour City'
  },
  {
    name: 'Paris',
    coordinates: [2.3522, 48.8566],
    description: 'City of Light'
  }
]

/**
 * Mental health service locations for testing
 */
export const mentalHealthServices = [
  {
    name: 'Community Mental Health Center',
    type: 'clinic',
    coordinates: [-74.0059, 40.7128],
    services: ['counseling', 'therapy', 'crisis intervention']
  },
  {
    name: 'Youth Counseling Services',
    type: 'youth_center',
    coordinates: [-74.0089, 40.7150],
    services: ['youth counseling', 'family therapy', 'group sessions']
  },
  {
    name: 'Crisis Support Hotline Center',
    type: 'crisis_center',
    coordinates: [-74.0020, 40.7100],
    services: ['24/7 hotline', 'emergency support', 'crisis counseling']
  }
]
