// Resource optimization utilities for reducing HTTP requests and improving performance

/**
 * Lazy load images with intersection observer
 * @param {string} selector - CSS selector for images to lazy load
 */
export const lazyLoadImages = (selector = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    })

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img)
    })
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll(selector).forEach(img => {
      img.src = img.dataset.src
      img.classList.remove('lazy')
      img.classList.add('loaded')
    })
  }
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource objects with type and href
 */
export const preloadCriticalResources = (resources) => {
  resources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = resource.type
    link.href = resource.href
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin
    }
    document.head.appendChild(link)
  })
}

/**
 * Combine multiple CSS classes into a single optimized string
 * @param {...string} classes - CSS classes to combine
 * @returns {string} Combined CSS classes
 */
export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Debounce function to reduce API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Create responsive image srcset
 * @param {string} basePath - Base path for images
 * @param {string} filename - Image filename without extension
 * @param {string} extension - Image extension
 * @param {Array} sizes - Array of sizes for responsive images
 * @returns {string} Srcset string
 */
export const createResponsiveSrcset = (basePath, filename, extension, sizes = [320, 640, 1280]) => {
  return sizes.map(size => `${basePath}/${filename}-${size}.${extension} ${size}w`).join(', ')
}

/**
 * Optimize bundle loading by preloading route chunks
 * @param {Array} routes - Array of route names to preload
 */
export const preloadRouteChunks = (routes) => {
  routes.forEach(route => {
    // This would be implemented based on your specific routing structure
    import(`@/views/${route}.vue`).catch(() => {
      // Silently fail if route doesn't exist
    })
  })
}
