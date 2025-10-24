<template>
  <div class="optimized-image-container" :class="containerClass">
    <img
      v-if="!useLazyLoading"
      :src="optimizedSrc"
      :srcset="responsiveSrcset"
      :sizes="imageSizes"
      :alt="alt"
      :class="imageClass"
      :loading="loading"
      @load="onImageLoad"
      @error="onImageError"
    >
    <img
      v-else
      :data-src="optimizedSrc"
      :data-srcset="responsiveSrcset"
      :sizes="imageSizes"
      :alt="alt"
      :class="['lazy', imageClass]"
      @load="onImageLoad"
      @error="onImageError"
    >
    <div v-if="showPlaceholder && !imageLoaded" class="image-placeholder">
      <div class="placeholder-content">
        <i class="material-icons">image</i>
        <span v-if="placeholderText">{{ placeholderText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createResponsiveSrcset, lazyLoadImages } from '@/utils/resourceOptimization'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  sizes: {
    type: Array,
    default: () => [320, 640, 1280]
  },
  imageSizes: {
    type: String,
    default: '(max-width: 320px) 280px, (max-width: 640px) 600px, 1200px'
  },
  quality: {
    type: Number,
    default: 80
  },
  format: {
    type: String,
    default: 'webp',
    validator: (value) => ['webp', 'jpg', 'png'].includes(value)
  },
  useLazyLoading: {
    type: Boolean,
    default: true
  },
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  containerClass: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: 'responsive-img'
  },
  showPlaceholder: {
    type: Boolean,
    default: true
  },
  placeholderText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['load', 'error'])

const imageLoaded = ref(false)

const optimizedSrc = computed(() => {
  // In a real implementation, you might use a service like Cloudinary or ImageKit
  // For now, we'll assume optimized images are available
  const pathParts = props.src.split('.')
  const extension = pathParts.pop()
  const basePath = pathParts.join('.')
  
  return `${basePath}-optimized.${props.format}`
})

const responsiveSrcset = computed(() => {
  const pathParts = props.src.split('.')
  const extension = pathParts.pop()
  const basePath = pathParts.join('.')
  const filename = basePath.split('/').pop()
  const directory = basePath.substring(0, basePath.lastIndexOf('/'))
  
  return createResponsiveSrcset(directory, filename, props.format, props.sizes)
})

const onImageLoad = (event) => {
  imageLoaded.value = true
  emit('load', event)
}

const onImageError = (event) => {
  // Fallback to original image if optimized version fails
  if (event.target.src.includes('-optimized')) {
    event.target.src = props.src
  }
  emit('error', event)
}

onMounted(() => {
  if (props.useLazyLoading) {
    lazyLoadImages('.lazy')
  }
})
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
}

.responsive-img {
  width: 100%;
  height: auto;
  display: block;
}

.lazy {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy.loaded {
  opacity: 1;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.placeholder-content {
  text-align: center;
}

.placeholder-content i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* CSS-based icons to replace small images */
.icon-heart::before {
  content: '♥';
  color: #e91e63;
}

.icon-star::before {
  content: '★';
  color: #ffc107;
}

.icon-check::before {
  content: '✓';
  color: #4caf50;
}

.icon-arrow::before {
  content: '→';
  color: #2196f3;
}
</style>
