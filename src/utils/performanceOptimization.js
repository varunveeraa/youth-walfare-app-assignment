// Performance optimization utilities for web vitals and user experience

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  if ('web-vitals' in window || typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          console.log('CLS:', clsValue)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

/**
 * Preload critical route chunks
 * @param {Array} routes - Array of route names to preload
 */
export const preloadCriticalRoutes = (routes) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = `/${route}`
        document.head.appendChild(link)
      })
    })
  }
}

/**
 * Optimize images with intersection observer
 * @param {string} selector - CSS selector for images
 */
export const optimizeImages = (selector = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
          }
          
          // Load srcset if available
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset
            img.removeAttribute('data-srcset')
          }
          
          img.classList.remove('lazy')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img)
    })
  }
}

/**
 * Implement service worker for caching
 */
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

/**
 * Optimize font loading
 */
export const optimizeFontLoading = () => {
  // Use font-display: swap for better performance
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
  `
  document.head.appendChild(style)
}

/**
 * Reduce main thread blocking
 * @param {Function} task - Task to run in idle time
 */
export const runInIdleTime = (task) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task)
  } else {
    setTimeout(task, 1)
  }
}

/**
 * Optimize third-party scripts loading
 */
export const optimizeThirdPartyScripts = () => {
  // Delay non-critical scripts
  const delayedScripts = [
    // Add any analytics or non-critical scripts here
  ]

  const loadDelayedScripts = () => {
    delayedScripts.forEach(src => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      document.head.appendChild(script)
    })
  }

  // Load after user interaction or after 3 seconds
  let hasInteracted = false
  const interactionEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
  
  const handleInteraction = () => {
    if (!hasInteracted) {
      hasInteracted = true
      loadDelayedScripts()
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }

  interactionEvents.forEach(event => {
    document.addEventListener(event, handleInteraction, { passive: true })
  })

  // Fallback: load after 3 seconds
  setTimeout(() => {
    if (!hasInteracted) {
      loadDelayedScripts()
    }
  }, 3000)
}

/**
 * Monitor and log performance metrics
 */
export const logPerformanceMetrics = () => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0]
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        windowLoad: perfData.loadEventEnd - perfData.navigationStart
      }
      
      console.log('Performance Metrics:', metrics)
      
      // You can send these metrics to your analytics service
      // analytics.track('performance', metrics)
    }, 0)
  })
}

/**
 * Initialize all performance optimizations
 */
export const initPerformanceOptimizations = () => {
  initPerformanceMonitoring()
  optimizeImages()
  optimizeFontLoading()
  optimizeThirdPartyScripts()
  logPerformanceMetrics()
  
  // Preload critical routes
  preloadCriticalRoutes(['dashboard', 'login', 'register'])
}
