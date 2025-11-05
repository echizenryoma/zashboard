<template>
  <!-- connections -->
  <div class="flex flex-col gap-2 p-4 text-sm">
    <div class="settings-title">
      {{ $t('connections') }}
    </div>
    <div class="settings-grid">
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('connectionStyle') }}
        </div>
        <select
          class="select select-sm min-w-24"
          v-model="useConnectionCard"
        >
          <option :value="false">
            {{ $t('table') }}
          </option>
          <option :value="true">
            {{ $t('card') }}
          </option>
        </select>
      </div>
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('proxyChainDirection') }}
        </div>
        <select
          class="select select-sm w-24"
          v-model="proxyChainDirection"
        >
          <option
            v-for="opt in Object.values(PROXY_CHAIN_DIRECTION)"
            :key="opt"
            :value="opt"
          >
            {{ $t(opt) }}
          </option>
        </select>
      </div>
    </div>
    <div
      class="settings-grid"
      v-if="!useConnectionCard"
    >
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('tableWidthMode') }}
        </div>
        <select
          class="select select-sm min-w-24"
          v-model="tableWidthMode"
        >
          <option
            v-for="opt in Object.values(TABLE_WIDTH_MODE)"
            :key="opt"
            :value="opt"
          >
            {{ $t(opt) }}
          </option>
        </select>
      </div>
      <div class="setting-item">
        <div class="setting-item-label">
          {{ $t('tableSize') }}
        </div>
        <select
          class="select select-sm min-w-24"
          v-model="tableSize"
        >
          <option
            v-for="opt in Object.values(TABLE_SIZE)"
            :key="opt"
            :value="opt"
          >
            {{ $t(opt) }}
          </option>
        </select>
      </div>
    </div>
    <div class="divider"></div>
    <SourceIPLabels />
  </div>
</template>

<script setup lang="ts">
import SourceIPLabels from '@/components/settings/SourceIPLabels.vue'
import { PROXY_CHAIN_DIRECTION, TABLE_SIZE, TABLE_WIDTH_MODE } from '@/constant'
import { proxyChainDirection, tableSize, tableWidthMode, useConnectionCard } from '@/store/settings'
</script>
