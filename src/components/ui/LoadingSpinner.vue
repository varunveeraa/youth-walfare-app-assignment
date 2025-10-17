<template>
  <div class="loading-container" :class="{ 'center-align': center }">
    <div class="preloader-wrapper" :class="size">
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
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'big'].includes(value)
  },
  message: {
    type: String,
    default: null
  },
  center: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.loading-container {
  padding: 2rem;
}

.loading-message {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.preloader-wrapper {
  margin: 0 auto;
}

.preloader-wrapper.small {
  width: 36px;
  height: 36px;
}

.preloader-wrapper.medium {
  width: 64px;
  height: 64px;
}

.preloader-wrapper.big {
  width: 96px;
  height: 96px;
}

/* Materialize spinner styles */
.spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  border-color: #26a69a;
}

.spinner-blue-only {
  border-color: #26a69a;
}

.circle-clipper {
  display: inline-block;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
  border-color: inherit;
}

.circle-clipper .circle {
  width: 200%;
  height: 100%;
  border-width: 3px;
  border-style: solid;
  border-color: inherit;
  border-bottom-color: transparent !important;
  border-radius: 50%;
  animation: rotate 1.4s ease-in-out infinite;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
}

.circle-clipper.left .circle {
  left: 0;
  border-right-color: transparent !important;
  transform: rotate(129deg);
}

.circle-clipper.right .circle {
  left: -100%;
  border-left-color: transparent !important;
  transform: rotate(-129deg);
}

.gap-patch {
  position: absolute;
  top: 0;
  left: 45%;
  width: 10%;
  height: 100%;
  overflow: hidden;
  border-color: inherit;
}

.gap-patch .circle {
  width: 1000%;
  left: -450%;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-layer {
  animation: fill-unfill-rotate 5332ms cubic-bezier(0.4, 0.0, 0.2, 1) infinite both;
}

@keyframes fill-unfill-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
</style>
