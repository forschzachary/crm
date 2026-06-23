<template>
  <div class="flex-1 min-h-0 overflow-auto bg-surface-gray-1">
    <div class="mx-auto max-w-4xl px-6 py-6">
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-lg font-medium text-ink-gray-9">Apps</h1>
        <div class="flex items-center gap-4 text-xs text-ink-gray-5">
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-green-600" />online</span>
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-amber-500" />login</span>
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-gray-400" />no page</span>
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-red-500" />down</span>
        </div>
      </div>
      <p class="text-xs text-ink-gray-4 mb-5">Status checked 2026-06-22. Tailscale (100.120.21.13) links need the tailnet.</p>

      <section v-for="group in groups" :key="group.name" class="mb-6">
        <h2 class="text-xs font-medium uppercase tracking-wide text-ink-gray-5 mb-2">{{ group.name }}</h2>
        <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
          <a
            v-for="app in group.apps"
            :key="app.url"
            :href="app.href"
            target="_blank"
            rel="noopener"
            class="relative flex items-center gap-3 rounded-lg border border-outline-gray-1 bg-surface-white px-3 py-2.5 hover:border-outline-gray-3 transition-colors"
          >
            <span class="absolute top-2.5 right-2.5 size-2 rounded-full" :class="dotClass(app.code)" :title="String(app.code)" />
            <FeatherIcon :name="app.icon" class="size-5 text-ink-gray-5 shrink-0" />
            <div class="min-w-0">
              <div class="text-sm font-medium text-ink-gray-8 truncate">{{ app.name }}</div>
              <div class="text-xs text-ink-gray-4 truncate">{{ app.url }}</div>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'

const P = 'https://'
const groups = [
  {
    name: 'Hubert & companion',
    apps: [
      { name: 'Hubert chat', url: 'chat.forschfrontiers.com', href: P + 'chat.forschfrontiers.com', icon: 'message-circle', code: 404 },
      { name: 'Huberto', url: 'huberto.forschfrontiers.com', href: P + 'huberto.forschfrontiers.com', icon: 'user', code: 502 },
      { name: 'Dashboard', url: 'dash.forschfrontiers.com', href: P + 'dash.forschfrontiers.com', icon: 'layout', code: 401 },
      { name: 'Companion API', url: 'companion-api.forschfrontiers.com', href: P + 'companion-api.forschfrontiers.com', icon: 'share-2', code: 404 },
      { name: 'Vapi voice', url: 'vapi.forschfrontiers.com', href: P + 'vapi.forschfrontiers.com', icon: 'phone', code: 404 },
      { name: 'Scarf', url: 'scarf.forschfrontiers.com', href: P + 'scarf.forschfrontiers.com', icon: 'cloud', code: 200 },
    ],
  },
  {
    name: 'Work · CRM',
    apps: [
      { name: 'Frappe CRM', url: 'crm.forschfrontiers.com', href: P + 'crm.forschfrontiers.com', icon: 'users', code: 403 },
      { name: 'Team Rooms', url: 'crm.forschfrontiers.com/g', href: P + 'crm.forschfrontiers.com/g', icon: 'message-square', code: 200 },
    ],
  },
  {
    name: 'ADK / dev stack · Tailscale',
    apps: [
      { name: 'Builder cockpit', url: '100.120.21.13:8780', href: 'http://100.120.21.13:8780', icon: 'tool', code: 403 },
      { name: 'LiteLLM proxy', url: '100.120.21.13:4000', href: 'http://100.120.21.13:4000', icon: 'cpu', code: 200 },
      { name: 'Rowboat UI', url: 'rowboat.forschfrontiers.com', href: P + 'rowboat.forschfrontiers.com', icon: 'anchor', code: 200 },
      { name: 'rowboatx server', url: '100.120.21.13:3005', href: 'http://100.120.21.13:3005', icon: 'git-branch', code: 404 },
      { name: 'Bridge chat', url: '100.120.21.13:8800/chat', href: 'http://100.120.21.13:8800/chat', icon: 'message-circle', code: 0 },
      { name: 'Flip-chat', url: '100.120.21.13:8801', href: 'http://100.120.21.13:8801', icon: 'message-square', code: 0 },
    ],
  },
  {
    name: 'Shelby & utilities',
    apps: [
      { name: 'Paperclip', url: 'paperclip.forschfrontiers.com', href: P + 'paperclip.forschfrontiers.com', icon: 'paperclip', code: 0 },
      { name: 'Groceries', url: 'groceries.forschfrontiers.com', href: P + 'groceries.forschfrontiers.com', icon: 'shopping-cart', code: 401 },
      { name: 'Grocery bridge', url: 'grocery-bridge.forschfrontiers.com', href: P + 'grocery-bridge.forschfrontiers.com', icon: 'link', code: 401 },
      { name: 'Shelby logs', url: 'logs-shelby.forschfrontiers.com', href: P + 'logs-shelby.forschfrontiers.com', icon: 'file-text', code: 404 },
      { name: 'Littlebird MCP', url: 'littlebird-mcp.forschfrontiers.com', href: P + 'littlebird-mcp.forschfrontiers.com', icon: 'feather', code: 401 },
      { name: 'Screening room', url: 'screening-room.forschfrontiers.com', href: P + 'screening-room.forschfrontiers.com', icon: 'film', code: 200 },
    ],
  },
  {
    name: 'Infra',
    apps: [
      { name: 'Authsome broker', url: 'authsome.forschfrontiers.com', href: P + 'authsome.forschfrontiers.com', icon: 'key', code: 200 },
    ],
  },
]

function dotClass(code) {
  if (code >= 200 && code < 400) return 'bg-green-600'
  if (code === 401 || code === 403) return 'bg-amber-500'
  if (code === 0 || code >= 500) return 'bg-red-500'
  return 'bg-gray-400'
}
</script>
