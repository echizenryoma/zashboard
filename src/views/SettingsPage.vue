<template>
  <div class="grid grid-cols-1 gap-2 overflow-y-auto p-2">
    <!-- dashboard -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4 text-primary">
        <div class="indicator">
          <span
            v-if="isUIUpdateAvailable"
            class="indicator-item flex"
          >
            <span class="badge badge-xs absolute animate-ping bg-secondary"></span>
            <span class="badge badge-xs bg-secondary"></span>
          </span>
          <a
            href="https://github.com/Zephyruso/zashboard"
            target="_blank"
            >zashboard v{{ zashboardVersion }}</a
          >
        </div>
      </div>
      <div class="card-body gap-4">
        <div class="flex items-center gap-2">
          {{ $t('theme') }}:
          <select
            class="select select-bordered select-sm w-48"
            v-model="theme"
          >
            <option
              v-for="opt in themes"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>
        <LanguageSelect />
        <div class="flex items-center gap-2">
          {{ $t('fonts') }}:
          <select
            class="select select-bordered select-sm w-48"
            v-model="font"
          >
            <option
              v-for="opt in Object.values(FONTS)"
              :key="opt"
              :value="opt"
              :label="opt"
            />
          </select>
        </div>
        <div
          class="flex items-center gap-2"
          v-if="!isSingBox"
        >
          {{ $t('autoUpgrade') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="autoUpgrade"
          />
        </div>
        <div class="grid max-w-screen-md grid-cols-2 gap-2 sm:grid-cols-4">
          <template v-if="!isSingBox">
            <button
              :class="
                twMerge('btn btn-primary btn-xs sm:btn-sm', isUIUpgrading ? 'animate-pulse' : '')
              "
              @click="handlerClickUpgradeUI"
            >
              {{ $t('upgradeUI') }}
            </button>
            <div class="sm:hidden"></div>
          </template>

          <button
            class="btn btn-xs sm:btn-sm"
            @click="handlerClickExport"
          >
            {{ $t('exportSettings') }}
          </button>
          <button
            class="btn btn-xs sm:btn-sm"
            @click="handlerClickImport"
          >
            {{ $t('importSettings') }}
          </button>
        </div>
      </div>
    </div>

    <!-- statistics -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4">
        {{ $t('statistics') }}
      </div>
      <div class="card-body gap-4">
        <div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <div class="card flex items-center justify-start bg-base-200/40 p-4">
            <StatisticsInfo class="h-20 w-full" />
          </div>
          <SpeedCharts />
          <MemoryCharts />
          <ConnectionsCharts />
        </div>
      </div>
    </div>

    <!-- backend -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4">
        {{ $t('backend') }}
      </div>
      <div class="card-body gap-4">
        <BackendSwitch />
        <div
          class="flex items-center gap-2"
          v-if="!isSingBox && configs?.tun"
        >
          {{ $t('tunMode') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="configs.tun.enable"
            @change="hanlderTunModeChange"
          />
        </div>
        <div class="grid max-w-screen-md grid-cols-2 gap-2 sm:grid-cols-4">
          <template v-if="!isSingBox">
            <div class="indicator w-full">
              <span
                v-if="isCoreUpdateAvailable"
                class="indicator-item flex"
              >
                <span class="badge badge-xs absolute animate-ping bg-secondary"></span>
                <span class="badge badge-xs bg-secondary"></span>
              </span>
              <button
                :class="
                  twMerge(
                    'btn btn-primary btn-xs flex-1 sm:btn-sm',
                    isCoreUpgrading ? 'animate-pulse' : '',
                  )
                "
                @click="handlerClickUpgradeCore"
              >
                {{ $t('upgradeCore') }}
              </button>
            </div>
            <button
              :class="twMerge('btn btn-xs sm:btn-sm', isCoreRestarting ? 'animate-pulse' : '')"
              @click="handlerClickRestartCore"
            >
              {{ $t('restartCore') }}
            </button>
          </template>
          <button
            :class="twMerge('btn btn-xs sm:btn-sm', isConfigReloading ? 'animate-pulse' : '')"
            @click="handlerClickReloadConfigs"
          >
            {{ $t('reloadConfigs') }}
          </button>
          <button
            class="btn btn-xs sm:btn-sm"
            @click="flushFakeIPAPI"
          >
            {{ $t('flushFakeIP') }}
          </button>
        </div>
        <div class="divider"></div>
        <DnsQuery />
      </div>
    </div>

    <!-- proxies -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4">
        {{ $t('proxies') }}
      </div>
      <div class="card-body grid grid-cols-1 gap-2 lg:grid-cols-2">
        <div class="flex items-center gap-2">
          {{ $t('proxyPreviewType') }}:
          <select
            class="select select-bordered select-sm"
            v-model="proxyPreviewType"
          >
            <option
              v-for="opt in Object.values(PROXY_PREVIEW_TYPE)"
              :key="opt"
              :value="opt"
            >
              {{ $t(opt) }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          {{ $t('truncateProxyName') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="truncateProxyName"
          />
        </div>
        <div class="flex items-center gap-2">
          {{ $t('automaticDisconnection') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="automaticDisconnection"
          />
        </div>
        <div class="flex items-center gap-2 max-sm:hidden">
          {{ $t('twoColumnProxyGroup') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="twoColumnProxyGroup"
          />
        </div>
        <div class="flex items-center gap-2 sm:hidden">
          {{ $t('twoColumnNodeForMobile') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="twoColumnNodeForMobile"
          />
        </div>
        <div class="flex w-full items-center gap-2">
          <span class="shrink-0"> {{ $t('speedtestUrl') }}: </span>
          <input
            type="text"
            class="input input-sm input-bordered w-60 max-sm:flex-1 sm:w-96"
            v-model="speedtestUrl"
          />
        </div>
        <div class="flex w-full items-center gap-2">
          <span class="shrink-0"> {{ $t('speedtestTimeout') }}: </span>
          <input
            type="text"
            class="input input-sm input-bordered w-20"
            v-model="speedtestTimeout"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0"> {{ $t('lowLatencyDesc') }}: </span>
          <input
            type="number"
            class="input input-sm input-bordered w-20"
            v-model="lowLatency"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0"> {{ $t('mediumLatencyDesc') }}: </span>
          <input
            type="number"
            class="input input-sm input-bordered w-20"
            v-model="mediumLatency"
          />
        </div>
        <div
          v-if="isSingBox"
          class="flex items-center gap-2"
        >
          {{ $t('showGlobalProxy') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="showGlobalProxy"
          />
        </div>
      </div>
    </div>

    <!-- connections -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4">
        {{ $t('connections') }}
      </div>
      <div class="card-body">
        <div class="flex items-center gap-2">
          {{ $t('connectionStyle') }}:
          {{ $t('table') }}
          <input
            class="toggle"
            type="checkbox"
            v-model="useConnectionCard"
          />
          {{ $t('card') }}
        </div>
        <div
          class="flex items-center gap-2 max-sm:hidden"
          v-if="useConnectionCard"
        >
          {{ $t('compactCard') }}:
          <input
            class="toggle"
            type="checkbox"
            v-model="compactConnectionCard"
          />
        </div>
        <TableSettings v-else />
        <div class="divider"></div>
        <SourceIPLabels />
      </div>
    </div>

    <!-- logs -->
    <div class="card card-compact">
      <div class="card-title px-4 pt-4">
        {{ $t('logs') }}
      </div>
      <div class="card-body">
        <div class="flex items-center gap-2">
          {{ $t('logRetentionLimit') }}:
          <input
            class="input input-sm input-bordered w-20"
            type="number"
            max="9999"
            v-model="logRetentionLimit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  flushFakeIPAPI,
  isCoreUpdateAvailable,
  isSingBox,
  reloadConfigsAPI,
  restartCoreAPI,
  upgradeCoreAPI,
  upgradeUIAPI,
  zashboardVersion,
} from '@/api'
import BackendSwitch from '@/components/settings/BackendSwitch.vue'
import DnsQuery from '@/components/settings/DnsQuery.vue'
import LanguageSelect from '@/components/settings/LanguageSelect.vue'
import SourceIPLabels from '@/components/settings/SourceIPLabels.vue'
import TableSettings from '@/components/settings/TableSettings.vue'
import StatisticsInfo from '@/components/sidebar/StatisticsInfo.vue'
import ConnectionsCharts from '@/components/statistics/ConnectionsCharts.vue'
import MemoryCharts from '@/components/statistics/MemoryCharts.vue'
import SpeedCharts from '@/components/statistics/SpeedCharts.vue'
import { useSettings } from '@/composables/settings'
import { FONTS, PROXY_PREVIEW_TYPE } from '@/config'
import { configs, updateConfigs } from '@/store/config'
import {
  automaticDisconnection,
  autoUpgrade,
  compactConnectionCard,
  font,
  logRetentionLimit,
  lowLatency,
  mediumLatency,
  proxyPreviewType,
  showGlobalProxy,
  speedtestTimeout,
  speedtestUrl,
  theme,
  truncateProxyName,
  twoColumnNodeForMobile,
  twoColumnProxyGroup,
  useConnectionCard,
} from '@/store/settings'
import { twMerge } from 'tailwind-merge'
import { ref } from 'vue'

const { isUIUpdateAvailable } = useSettings()

const isCoreRestarting = ref(false)
const handlerClickRestartCore = async () => {
  if (isCoreRestarting.value) return
  isCoreRestarting.value = true
  try {
    await restartCoreAPI()
    isCoreRestarting.value = false
  } catch {
    isCoreRestarting.value = false
  }
}

const isCoreUpgrading = ref(false)
const handlerClickUpgradeCore = async () => {
  if (isCoreUpgrading.value) return
  isCoreUpgrading.value = true
  try {
    await upgradeCoreAPI()
    isCoreUpgrading.value = false
  } catch {
    isCoreUpgrading.value = false
  }
}

const isUIUpgrading = ref(false)
const handlerClickUpgradeUI = async () => {
  if (isUIUpgrading.value) return
  isUIUpgrading.value = true
  try {
    await upgradeUIAPI()
    isUIUpgrading.value = false
  } catch {
    isUIUpgrading.value = false
  }
}

const isConfigReloading = ref(false)
const handlerClickReloadConfigs = async () => {
  if (isConfigReloading.value) return
  isConfigReloading.value = true
  try {
    await reloadConfigsAPI()
    isConfigReloading.value = false
  } catch {
    isConfigReloading.value = false
  }
}

const hanlderTunModeChange = async () => {
  await updateConfigs({ tun: { enable: configs.value?.tun.enable } })
}

const themes = [
  'default',
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
]

const handlerClickExport = () => {
  const settings: Record<string, string | null> = {}

  for (const key in localStorage) {
    if (key.startsWith('config/') || key.startsWith('setup/')) {
      settings[key] = localStorage.getItem(key)
    }
  }

  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'zashboard-settings'
  a.click()
  URL.revokeObjectURL(url)
}

const handlerClickImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const settings = JSON.parse(reader.result as string)
      for (const key in settings) {
        localStorage.setItem(key, settings[key])
      }
      location.reload()
    }
    reader.readAsText(file)
  }
  input.click()
}
</script>
