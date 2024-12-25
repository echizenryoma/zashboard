<template>
  <div
    :class="
      twMerge(
        'flex items-center justify-center rounded-xl bg-base-100 text-xs hover:bg-slate-100',
        color,
      )
    "
  >
    <BoltIcon
      v-if="latency === NOT_CONNECTED"
      class="h-3 w-3 text-base-content"
    />
    <div
      v-show="latency !== NOT_CONNECTED"
      ref="latencyRef"
    >
      {{ latency }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { NOT_CONNECTED } from '@/config'
import { getLatencyByName } from '@/store/proxies'
import { lowLatency, mediumLatency } from '@/store/settings'
import { BoltIcon } from '@heroicons/vue/24/outline'
import { CountUp } from 'countup.js'
import { twMerge } from 'tailwind-merge'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  name: string
}>()
const latencyRef = ref()
const latency = computed(() => getLatencyByName(props.name))

let countUp: CountUp | null = null

onMounted(() => {
  watch(latency, (value, OldValue) => {
    if (!countUp) {
      nextTick(() => {
        countUp = new CountUp(latencyRef.value, latency.value, {
          duration: 1,
          separator: '',
          enableScrollSpy: false,
          startVal: OldValue,
        })
        countUp?.update(value)
      })
    } else {
      countUp?.update(value)
    }
  })
})

onUnmounted(() => {
  countUp = null
})

const color = computed(() => {
  if (latency.value === NOT_CONNECTED) {
    return ''
  } else if (latency.value < lowLatency.value) {
    return 'text-green-500'
  } else if (latency.value < mediumLatency.value) {
    return 'text-yellow-500'
  } else {
    return 'text-red-500'
  }
})
</script>
