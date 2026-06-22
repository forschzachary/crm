<template>
  <div class="flex-1 min-h-0 relative">
    <iframe
      src="https://rowboat.forschfrontiers.com/"
      title="AI Assistant"
      class="absolute inset-0 w-full h-full border-0"
      allow="clipboard-read; clipboard-write; microphone"
    />
    <button
      @click="$router.push({ name: 'Leads' })"
      title="Back to CRM"
      style="position:absolute;right:16px;bottom:16px;z-index:10;display:flex;align-items:center;gap:6px;background:rgba(31,41,55,.92);color:#fff;padding:8px 14px;border-radius:9999px;font:500 13px system-ui,sans-serif;border:0;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.28)"
    >&#8592;&nbsp;CRM</button>
  </div>
</template>
