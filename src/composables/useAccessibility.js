import { ref, nextTick } from 'vue'

/**
 * Accessibility composable for focus management and screen reader support
 */
export function useAccessibility() {
  const announcements = ref('')
  const focusStack = ref([])

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  const announce = (message, priority = 'polite') => {
    announcements.value = message
    
    // Clear announcement after a short delay to allow re-announcement of same message
    setTimeout(() => {
      announcements.value = ''
    }, 1000)
  }

  /**
   * Focus an element by selector or element reference
   * @param {string|HTMLElement} target - CSS selector or element to focus
   * @param {number} delay - Delay before focusing (default: 100ms)
   */
  const focusElement = async (target, delay = 100) => {
    await nextTick()
    
    setTimeout(() => {
      let element
      
      if (typeof target === 'string') {
        element = document.querySelector(target)
      } else {
        element = target
      }
      
      if (element && typeof element.focus === 'function') {
        element.focus()
      }
    }, delay)
  }

  /**
   * Save current focus and focus a new element
   * @param {string|HTMLElement} target - Element to focus
   */
  const pushFocus = async (target) => {
    const currentFocus = document.activeElement
    if (currentFocus) {
      focusStack.value.push(currentFocus)
    }
    await focusElement(target)
  }

  /**
   * Restore previous focus from stack
   */
  const popFocus = async () => {
    if (focusStack.value.length > 0) {
      const previousFocus = focusStack.value.pop()
      await focusElement(previousFocus)
    }
  }

  /**
   * Trap focus within a container (for modals, dropdowns)
   * @param {HTMLElement} container - Container element
   * @returns {Function} Cleanup function
   */
  const trapFocus = (container) => {
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Let parent handle escape (usually close modal)
        event.stopPropagation()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    container.addEventListener('keydown', handleEscapeKey)

    // Focus first element
    if (firstElement) {
      firstElement.focus()
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
      container.removeEventListener('keydown', handleEscapeKey)
    }
  }

  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {NodeList} Focusable elements
   */
  const getFocusableElements = (container) => {
    return container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  }

  /**
   * Check if element is visible and focusable
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether element is focusable
   */
  const isFocusable = (element) => {
    if (!element) return false
    
    const style = window.getComputedStyle(element)
    return (
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      !element.disabled
    )
  }

  /**
   * Move focus to next/previous focusable element
   * @param {HTMLElement} container - Container to search within
   * @param {boolean} reverse - Move backwards if true
   */
  const moveFocus = (container, reverse = false) => {
    const focusableElements = Array.from(getFocusableElements(container))
    const currentIndex = focusableElements.indexOf(document.activeElement)
    
    let nextIndex
    if (reverse) {
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
    } else {
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
    }
    
    const nextElement = focusableElements[nextIndex]
    if (nextElement && isFocusable(nextElement)) {
      nextElement.focus()
    }
  }

  /**
   * Handle arrow key navigation for lists/grids
   * @param {KeyboardEvent} event - Keyboard event
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Navigation options
   */
  const handleArrowNavigation = (event, container, options = {}) => {
    const { 
      itemSelector = '[role="option"], button, a[href]',
      orientation = 'vertical', // 'vertical', 'horizontal', 'grid'
      wrap = true 
    } = options

    const items = Array.from(container.querySelectorAll(itemSelector))
    const currentIndex = items.indexOf(document.activeElement)
    
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault()
          nextIndex = wrap && currentIndex === items.length - 1 ? 0 : Math.min(currentIndex + 1, items.length - 1)
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault()
          nextIndex = wrap && currentIndex === 0 ? items.length - 1 : Math.max(currentIndex - 1, 0)
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault()
          nextIndex = wrap && currentIndex === items.length - 1 ? 0 : Math.min(currentIndex + 1, items.length - 1)
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault()
          nextIndex = wrap && currentIndex === 0 ? items.length - 1 : Math.max(currentIndex - 1, 0)
        }
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = items.length - 1
        break
    }

    if (nextIndex !== currentIndex && items[nextIndex]) {
      items[nextIndex].focus()
    }
  }

  return {
    announcements,
    announce,
    focusElement,
    pushFocus,
    popFocus,
    trapFocus,
    getFocusableElements,
    isFocusable,
    moveFocus,
    handleArrowNavigation
  }
}
