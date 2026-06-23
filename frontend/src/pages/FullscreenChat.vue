<template>
  <div class="flex-1 min-h-0 relative bg-gray-900">
    <!-- Loading overlay — dark, hides when iframe loads -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900 transition-opacity duration-300"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="size-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
        <span class="text-xs text-gray-400">Loading agent chat…</span>
      </div>
    </div>
    <iframe
      ref="chatFrame"
      src="https://crm.forschfrontiers.com/agent-chat"
      title="Agent Chat"
      class="absolute inset-0 w-full h-full border-0"
      allow="clipboard-read; clipboard-write; microphone"
      @load="onLoad"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(true)
const chatFrame = ref(null)

function onLoad() {
  // Small delay so Chainlit's own dark shell has time to paint
  setTimeout(() => {
    loading.value = false
  }, 400)
}
</script>