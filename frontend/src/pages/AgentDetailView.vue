<template>
  <div class="flex h-full flex-col overflow-hidden">
    <LayoutHeader>
      <template #left-header>
        <Breadcrumbs :items="breadcrumbs" />
      </template>
      <template #right-header>
        <Button
          :label="__('Save')"
          variant="solid"
          :disabled="!dirty"
          @click="handleSave"
        />
        <Button
          :label="__('⚡ Generate & Verify')"
          variant="solid"
          theme="green"
          @click="handleGenerate"
        />
        <Dropdown :options="deleteOptions" placement="right">
          <Button
            :label="__('🗑 Delete')"
            variant="subtle"
            theme="red"
          />
        </Dropdown>
      </template>
    </LayoutHeader>

    <div class="flex flex-1 overflow-hidden">
      <!-- Main config area -->
      <div class="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
        <!-- Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Name') }}</label>
          <input
            v-model="agent.name"
            type="text"
            class="form-input w-full max-w-md rounded border px-3 py-2 text-base"
            :placeholder="__('agent_id')"
            disabled
          />
        </div>

        <!-- Model dropdown -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Model') }}</label>
          <Dropdown
            v-model="agent.model"
            :options="modelOptions"
            class="w-full max-w-md"
            :placeholder="__('Select a model')"
          />
        </div>

        <!-- Temperature slider with zones -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">
            {{ __('Temperature') }}: <span class="font-mono">{{ agent.temperature.toFixed(1) }}</span>
          </label>
          <div class="flex w-full max-w-md flex-col gap-2">
            <input
              v-model.number="agent.temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-ink-gray-5">
              <span class="w-1/3 text-left">Precise</span>
              <span class="w-1/3 text-center">Balanced</span>
              <span class="w-1/3 text-right">Creative</span>
            </div>
            <div class="relative h-1 w-full rounded bg-gray-200">
              <div class="absolute left-0 h-full w-[20%] rounded-l bg-blue-200" />
              <div class="absolute left-[20%] h-full w-[40%] bg-green-200" />
              <div class="absolute left-[60%] h-full w-[40%] rounded-r bg-orange-200" />
            </div>
          </div>
        </div>

        <!-- Max Tokens -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Max Tokens') }}</label>
          <input
            v-model.number="agent.max_tokens"
            type="number"
            class="form-input w-32 rounded border px-3 py-2 text-base"
            min="1"
            max="8192"
          />
        </div>

        <!-- Advanced: Top-p -->
        <div class="flex flex-col gap-1.5">
          <button
            class="flex items-center gap-1 text-sm font-medium text-ink-gray-7 hover:text-ink-gray-9"
            @click="showAdvanced = !showAdvanced"
          >
            <span>{{ showAdvanced ? '▾' : '▸' }}</span>
            {{ __('Advanced') }}
          </button>
          <div v-if="showAdvanced" class="flex flex-col gap-1.5 pl-5">
            <label class="text-sm font-medium text-ink-gray-7">{{ __('Top-p') }}</label>
            <input
              v-model.number="agent.top_p"
              type="number"
              class="form-input w-32 rounded border px-3 py-2 text-base"
              min="0"
              max="1"
              step="0.01"
            />
          </div>
        </div>

        <!-- System Instruction -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('System Instruction') }}</label>
          <textarea
            v-model="agent.instruction"
            class="form-input w-full max-w-2xl rounded border px-3 py-2 text-base"
            rows="5"
            :placeholder="__('You are a helpful agent...')"
          />
        </div>

        <!-- Tools -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Tools') }}</label>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tool in agent.tools"
              :key="tool"
              class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {{ tool }}
              <button class="ml-1 text-gray-400 hover:text-red-500" @click="removeTool(tool)">×</button>
            </span>
            <Dropdown
              :options="availableToolOptions"
              :placeholder="__('+ Add Tool')"
              @change="addTool"
            >
              <Button :label="__('+ Add Tool')" variant="subtle" />
            </Dropdown>
          </div>
          <div
            v-if="agent.tools.length >= 5"
            class="mt-1 text-sm text-amber-600"
          >
            ⚠ {{ agent.tools.length }} of 7 tool slots used (soft cap)
          </div>
          <div
            v-if="agent.tools.length >= 7"
            class="mt-1 text-sm text-red-500"
          >
            7+ tools degrades reliability. Consider a sub-agent.
          </div>
        </div>

        <!-- Sub-Agents (read-only) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Sub-Agents') }}</label>
          <span class="text-sm text-ink-gray-5">{{ agent.sub_agents.length ? agent.sub_agents.join(', ') : __('(none wired)') }}</span>
        </div>

        <!-- Parent (read-only) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink-gray-7">{{ __('Parent') }}</label>
          <span class="text-sm text-ink-gray-5">{{ agent.parent || __('(none)') }}</span>
        </div>

        <!-- Status pill -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-ink-gray-7">{{ __('Status') }}:</span>
          <span
            class="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium"
            :class="statusClass"
          >
            <span class="size-2 rounded-full" :class="statusDotClass" />
            {{ agent.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Button,
  Dropdown,
  Breadcrumbs,
  toast,
} from 'frappe-ui'
import LayoutHeader from '@/components/LayoutHeader.vue'

const router = useRouter()
const route = useRoute()

// ── Mock data (TODO: Task 6 — wire to Frappe proxies) ──
const agent = ref({
  name: 'calendar_specialist',
  model: 'gemini-2.5-flash',
  temperature: 0.3,
  max_tokens: 500,
  top_p: 0.95,
  instruction: 'You manage the family calendar. You are strictly logical. Always confirm before booking.',
  tools: ['check_schedule', 'book_event'],
  sub_agents: [],
  parent: 'primary_assistant',
  status: 'built',
})

const dirty = ref(false)
const showAdvanced = ref(false)

// ── Breadcrumbs ──
const breadcrumbs = computed(() => [
  { label: 'Agent Builder', route: '/agent-builder' },
  { label: `Project: demo > agent: ${agent.value.name}` },
])

// ── Model options (TODO: fetch from /agent-models) ──
const modelOptions = [
  { label: 'gemini-2.5-flash', value: 'gemini-2.5-flash' },
  { label: 'gemini-2.5-pro', value: 'gemini-2.5-pro' },
  { label: 'gpt-5.5', value: 'gpt-5.5' },
  { label: 'gpt-5.4', value: 'gpt-5.4' },
  { label: 'glm-5.2', value: 'glm-5.2' },
  { label: 'deepseek-v4-pro', value: 'deepseek-v4-pro' },
  { label: 'deepseek-v4-flash', value: 'deepseek-v4-flash' },
  { label: 'cerebras-120b', value: 'cerebras-120b' },
  { label: 'qwen3-coder-480b', value: 'qwen3-coder-480b' },
]

// ── Available tools (TODO: fetch from /agent-tools) ──
const availableToolOptions = [
  { label: 'check_schedule', value: 'check_schedule' },
  { label: 'book_event', value: 'book_event' },
  { label: 'get_crm_health_snapshot', value: 'get_crm_health_snapshot' },
  { label: 'list_recent_crm_leads', value: 'list_recent_crm_leads' },
  { label: 'get_workspace_inventory', value: 'get_workspace_inventory' },
  { label: 'validate_agent_imports', value: 'validate_agent_imports' },
  { label: 'check_service_health', value: 'check_service_health' },
]

// ── Status styling ──
const statusClass = computed(() => {
  const map = {
    blank: 'bg-gray-100 text-gray-600',
    building: 'bg-yellow-100 text-yellow-700',
    built: 'bg-green-100 text-green-700',
    live: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700',
  }
  return map[agent.value.status] || map.blank
})

const statusDotClass = computed(() => {
  const map = {
    blank: 'bg-gray-400',
    building: 'bg-yellow-500',
    built: 'bg-green-500',
    live: 'bg-blue-500',
    error: 'bg-red-500',
  }
  return map[agent.value.status] || map.blank
})

// ── Delete options ──
const deleteOptions = [
  { label: 'Confirm Delete', onClick: () => toast({ title: 'TODO: delete agent' }) },
]

// ── Actions (TODO: Task 6 — wire to Frappe proxies) ──
function handleSave() {
  toast({ title: 'TODO: Save agent config via Frappe proxy' })
  dirty.value = false
}

function handleGenerate() {
  toast({ title: 'TODO: Generate & Verify via Frappe proxy' })
}

function addTool(tool) {
  if (!agent.value.tools.includes(tool)) {
    agent.value.tools.push(tool)
    dirty.value = true
  }
}

function removeTool(tool) {
  agent.value.tools = agent.value.tools.filter((t) => t !== tool)
  dirty.value = true
}
</script>
