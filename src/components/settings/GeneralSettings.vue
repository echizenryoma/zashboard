<template>
  <ZashboardSettings />
  <div class="divider my-4" />
  <!-- dashboard -->
  <div class="p-4 text-sm">
    <div class="flex items-center gap-2 py-4 text-lg font-bold">
      {{ $t('general') }}
    </div>
    <div class="settings-grid">
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('autoDisconnectIdleUDP') }}
        </div>
        <input
          type="checkbox"
          v-model="autoDisconnectIdleUDP"
          class="toggle"
        />
        <QuestionMarkCircleIcon
          class="h-4 w-4 cursor-pointer"
          @mouseenter="showTip($event, $t('autoDisconnectIdleUDPTip'))"
        />
      </div>
      <div
        class="setting-item"
        v-if="autoDisconnectIdleUDP"
      >
        <div class="setting-item-label">
          {{ $t('autoDisconnectIdleUDPTime') }}
        </div>
        <input
          type="number"
          class="input input-sm w-20"
          v-model="autoDisconnectIdleUDPTime"
        />
        mins
      </div>
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('IPInfoAPI') }}
        </div>
        <select
          class="select select-sm min-w-24"
          v-model="IPInfoAPI"
        >
          <option
            v-for="opt in Object.values(IP_INFO_API)"
            :key="opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>
        <QuestionMarkCircleIcon
          class="h-4 w-4 cursor-pointer"
          @mouseenter="showTip($event, $t('IPInfoAPITip'))"
        />
      </div>

      <div class="setting-item md:hidden">
        <div class="setting-item-label">
          {{ $t('scrollAnimationEffect') }}
        </div>
        <input
          type="checkbox"
          v-model="scrollAnimationEffect"
          class="toggle"
        />
      </div>
      <div class="setting-item md:hidden">
        <div class="setting-item-label">
          {{ $t('swipeInPages') }}
        </div>
        <input
          type="checkbox"
          v-model="swipeInPages"
          class="toggle"
        />
      </div>
      <div
        class="setting-item md:hidden"
        v-if="swipeInPages"
      >
        <div class="setting-item-label">
          {{ $t('swipeInTabs') }}
        </div>
        <input
          type="checkbox"
          v-model="swipeInTabs"
          class="toggle"
        />
      </div>
      <div class="setting-item md:hidden">
        <div class="setting-item-label">
          {{ $t('disablePullToRefresh') }}
        </div>
        <input
          type="checkbox"
          v-model="disablePullToRefresh"
          class="toggle"
        />
        <QuestionMarkCircleIcon
          class="h-4 w-4 cursor-pointer"
          @mouseenter="showTip($event, $t('disablePullToRefreshTip'))"
        />
      </div>
      <div
        class="setting-item"
        v-if="isSingBox"
      >
        <div class="setting-item-label">
          {{ $t('displayAllFeatures') }}
        </div>
        <input
          type="checkbox"
          v-model="displayAllFeatures"
          class="toggle"
        />
        <QuestionMarkCircleIcon
          class="h-4 w-4 cursor-pointer"
          @mouseenter="showTip($event, $t('displayAllFeaturesTip'))"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isSingBox } from '@/api'
import { IP_INFO_API } from '@/constant'
import { useTooltip } from '@/helper/tooltip'
import {
  autoDisconnectIdleUDP,
  autoDisconnectIdleUDPTime,
  disablePullToRefresh,
  displayAllFeatures,
  IPInfoAPI,
  scrollAnimationEffect,
  swipeInPages,
  swipeInTabs,
} from '@/store/settings'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import ZashboardSettings from './ZashboardSettings.vue'

const { showTip } = useTooltip()
</script>
