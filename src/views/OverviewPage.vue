<template>
  <div
    class="flex h-full flex-col gap-2 overflow-x-hidden overflow-y-auto p-2"
    :style="padding"
  >
    <ChartsCard />
    <NetworkCard v-if="showIPAndConnectionInfo" />
    <div
      class="card"
      v-if="displayConnectionTopology"
    >
      <div class="card-title absolute px-4 pt-4">
        {{ $t('connectionTopology') }}
      </div>
      <TopologyCharts />
    </div>
    <ConnectionHistory />
    <div class="flex flex-1 flex-col items-center justify-end">
      <div class="card w-full flex-row items-center justify-center gap-2 p-2 text-xs sm:text-sm">
        {{ getLabelFromBackend(activeBackend!) }}
        <span class="mx-1">|</span>
        <BackendVersion />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackendVersion from '@/components/common/BackendVersion.vue'
import ChartsCard from '@/components/overview/ChartsCard.vue'
import ConnectionHistory from '@/components/overview/ConnectionHistory.vue'
import NetworkCard from '@/components/overview/NetworkCard.vue'
import TopologyCharts from '@/components/overview/TopologyCharts.vue'
import { usePaddingForViews } from '@/composables/paddingViews'
import { getLabelFromBackend } from '@/helper/utils'
import { displayConnectionTopology, showIPAndConnectionInfo } from '@/store/settings'
import { activeBackend } from '@/store/setup'
const { padding } = usePaddingForViews()
</script>
