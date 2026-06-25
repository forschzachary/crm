<template>
  <div class="flex-1 min-h-0 overflow-auto bg-surface-gray-1">
    <div class="mx-auto max-w-3xl px-6 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2 min-w-0">
          <router-link to="/apps" class="text-ink-gray-4 hover:text-ink-gray-7 shrink-0">
            <ArrowLeftIcon class="size-4" />
          </router-link>
          <h1 class="text-lg font-medium text-ink-gray-9 truncate">{{ agentId }}</h1>
          <!-- Status pill -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium shrink-0"
            :class="statusPill.cls"
            :title="status.error || ''"
          >
            <LoaderIcon v-if="status.state === 'building'" class="size-3 animate-spin" />
            <span v-else class="size-2 rounded-full" :class="statusPill.dot" />
            {{ statusPill.label }}
          </span>
        </div>
      </div>
      <p class="text-xs text-ink-gray-4 mb-5">ADK agent configuration · changes apply on Generate &amp; Verify.</p>

      <!-- Banner -->
      <div
        v-if="banner"
        class="mb-4 rounded-md border px-3 py-2 text-sm"
        :class="banner.type === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'"
      >{{ banner.msg }}</div>

      <!-- Loading / error -->
      <div v-if="loading" class="text-sm text-ink-gray-4 py-10 text-center">Loading agent…</div>
      <div v-else-if="error" class="text-sm text-red-500 py-10 text-center">{{ error }}</div>

      <template v-else>
        <!-- Verify error detail -->
        <div v-if="status.state === 'error' && status.error" class="mb-5 rounded-md border border-red-200 bg-red-50 p-3">
          <div class="text-xs font-medium text-red-700 mb-1">Verification failed</div>
          <pre class="text-[11px] text-red-600 whitespace-pre-wrap break-words max-h-40 overflow-auto">{{ status.error }}</pre>
        </div>

        <!-- Model -->
        <label class="block mb-5">
          <span class="block text-xs font-medium uppercase tracking-wide text-ink-gray-5 mb-1.5">Model</span>
          <select
            v-model="form.model"
            class="w-full text-sm text-ink-gray-8 bg-surface-white border border-outline-gray-2 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-outline-gray-4"
          >
            <option value="">(inherit default)</option>
            <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>

        <!-- Instruction -->
        <label class="block mb-5">
          <span class="block text-xs font-medium uppercase tracking-wide text-ink-gray-5 mb-1.5">System instruction</span>
          <textarea
            v-model="form.instruction"
            rows="7"
            class="w-full text-sm text-ink-gray-8 bg-surface-white border border-outline-gray-2 rounded-md px-2.5 py-2 font-mono leading-relaxed focus:outline-none focus:border-outline-gray-4"
            placeholder="You are…"
          />
        </label>

        <!-- Tools -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-ink-gray-5">Tools</span>
            <span
              class="text-xs"
              :class="overCap ? 'text-red-500' : nearCap ? 'text-amber-600' : 'text-ink-gray-4'"
            >{{ toolCount }}/{{ MAX_TOOLS }}{{ overCap ? ' — over ADK atomic-tool cap' : nearCap ? ' — near cap' : '' }}</span>
          </div>
          <!-- Selected -->
          <div v-if="form.tools.length" class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="t in form.tools"
              :key="t"
              class="inline-flex items-center gap-1 rounded-md bg-surface-gray-2 px-2 py-0.5 text-xs text-ink-gray-8"
            >
              {{ t }}
              <button @click="toggleTool(t)" class="text-ink-gray-4 hover:text-ink-gray-7"><XIcon class="size-3" /></button>
            </span>
          </div>
          <!-- Palette -->
          <div class="rounded-md border border-outline-gray-1 bg-surface-white divide-y divide-outline-gray-1 max-h-64 overflow-auto">
            <button
              v-for="tool in toolPalette"
              :key="tool.name"
              @click="toggleTool(tool.name)"
              :disabled="!form.tools.includes(tool.name) && form.tools.length >= MAX_TOOLS"
              class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-gray-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckIcon
                class="size-3.5 mt-0.5 shrink-0"
                :class="form.tools.includes(tool.name) ? 'text-green-600' : 'text-transparent'"
              />
              <span class="min-w-0">
                <span class="block text-sm text-ink-gray-8">{{ tool.name }}</span>
                <span class="block text-xs text-ink-gray-4 truncate">{{ tool.summary }}</span>
              </span>
            </button>
            <div v-if="!toolPalette.length" class="px-3 py-4 text-xs text-ink-gray-4 text-center">No tools available.</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 sticky bottom-0 bg-surface-gray-1 py-3 -mx-6 px-6 border-t border-outline-gray-1">
          <button
            @click="save"
            :disabled="!dirty || saving || generating"
            class="rounded-md bg-surface-white border border-outline-gray-2 px-3 py-1.5 text-sm text-ink-gray-8 hover:border-outline-gray-4 disabled:opacity-40"
          >{{ saving ? 'Saving…' : 'Save' }}</button>
          <button
            @click="generate"
            :disabled="saving || generating"
            class="rounded-md bg-ink-gray-9 px-3 py-1.5 text-sm text-surface-white hover:bg-ink-gray-8 disabled:opacity-40 flex items-center gap-1.5"
          >
            <LoaderIcon v-if="generating" class="size-3.5 animate-spin" />
            {{ generating ? 'Generating…' : 'Generate & Verify' }}
          </button>
          <span v-if="dirty" class="text-xs text-amber-600">unsaved changes</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon, LoaderIcon, XIcon, CheckIcon } from 'lucide-vue-next'

const route = useRoute()
const agentId = route.params.agentId

const API = '/api/method/forsch_frontiers.api.'
const MAX_TOOLS = 7   // ADK atomic-tool guidance: 5-7 per agent
const WARN_TOOLS = 5

const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const generating = ref(false)
const banner = ref(null)

const form = ref({ model: '', instruction: '', tools: [] })
const original = ref({})
const toolPalette = ref([])
const models = ref([])
const status = ref({ state: 'unknown', label: '…', error: null })

// Proxies return the box JSON directly (werkzeug Response), NOT Frappe-wrapped in .message.
async function getJSON(path) {
  const r = await fetch(API + path, { credentials: 'include' })
  return r.json()
}
async function postJSON(path, body) {
  const r = await fetch(API + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

async function loadConfig() {
  const d = await getJSON(`agent_config.get?agent_id=${encodeURIComponent(agentId)}`)
  // "unknown agent" is a blank slate — not an error. Initialize empty form.
  if (d.ok === false) {
    if (d.error && d.error.startsWith('unknown agent')) {
      form.value = { model: '', instruction: '', tools: [] }
      original.value = JSON.parse(JSON.stringify(form.value))
      return
    }
    error.value = d.error || 'Failed to load config'; return
  }
  const a = d.agent || {}
  form.value = {
    model: a.model || '',
    instruction: a.instruction || '',
    tools: Array.isArray(a.tools) ? [...a.tools] : [],
  }
  original.value = JSON.parse(JSON.stringify(form.value))
}
async function loadTools() {
  const d = await getJSON('agent_config.tools')
  if (d.ok !== false) toolPalette.value = d.tools || []
}
async function loadModels() {
  const d = await getJSON('agent_config.models')
  if (d.ok !== false) models.value = d.models || []
}
async function loadStatus() {
  const d = await getJSON(`agent_factory.status?agent_id=${encodeURIComponent(agentId)}`)
  if (d.ok === false) return
  status.value = deriveStatus(d)
}
// G7 status derivation — mirror of the box gate (built ONLY on a passing verify).
function deriveStatus(d) {
  if (!d.package_exists) return { state: 'blank', label: 'Not built', error: null }
  if (d.status === 'built' || d.import_ok === true) return { state: 'built', label: 'Built', error: null }
  return { state: 'error', label: 'Error', error: d.error || 'verification failed' }
}

const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(original.value))
const toolCount = computed(() => form.value.tools.length)
const overCap = computed(() => toolCount.value > MAX_TOOLS)
const nearCap = computed(() => toolCount.value >= WARN_TOOLS)

const statusPill = computed(() => {
  const map = {
    built: { label: 'Built', cls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
    error: { label: 'Error', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
    blank: { label: 'Not built', cls: 'bg-surface-gray-2 text-ink-gray-6', dot: 'bg-gray-400' },
    building: { label: 'Building…', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  }
  return map[status.value.state] || { label: '…', cls: 'bg-surface-gray-2 text-ink-gray-5', dot: 'bg-gray-300' }
})

function toggleTool(name) {
  const i = form.value.tools.indexOf(name)
  if (i >= 0) form.value.tools.splice(i, 1)
  else if (form.value.tools.length < MAX_TOOLS) form.value.tools.push(name)
}

async function save() {
  saving.value = true; banner.value = null
  try {
    const d = await postJSON('agent_config.save', {
      agent_id: agentId,
      model: form.value.model,
      instruction: form.value.instruction,
      tools: form.value.tools.join(','),
    })
    if (d.ok === false) { banner.value = { type: 'error', msg: d.error || 'Save failed' } }
    else { original.value = JSON.parse(JSON.stringify(form.value)); banner.value = { type: 'ok', msg: 'Saved.' } }
  } catch (e) { banner.value = { type: 'error', msg: String(e) } }
  finally { saving.value = false }
}

let pollTimer = null
async function generate() {
  generating.value = true; banner.value = null
  status.value = { state: 'building', label: 'Building…', error: null }
  try {
    const d = await postJSON('agent_factory.generate', { agent_id: agentId })
    if (d.ok === false) {
      banner.value = { type: 'error', msg: d.error || 'Generate failed' }
      generating.value = false; await loadStatus(); return
    }
    // Poll the verify status until it resolves (built or error).
    pollTimer = setInterval(async () => {
      await loadStatus()
      if (status.value.state === 'built' || status.value.state === 'error') {
        clearInterval(pollTimer); pollTimer = null; generating.value = false
        banner.value = status.value.state === 'built'
          ? { type: 'ok', msg: 'Built + verified.' }
          : { type: 'error', msg: status.value.error || 'Verification failed.' }
      }
    }, 2000)
  } catch (e) {
    banner.value = { type: 'error', msg: String(e) }; generating.value = false
  }
}

onMounted(async () => {
  try { await Promise.all([loadConfig(), loadTools(), loadModels(), loadStatus()]) }
  finally { loading.value = false }
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>
