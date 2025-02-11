<template>
  <div>{{ $t('sourceIPLabels') }}</div>
  <div class="flex flex-col gap-2 p-1 pr-0">
    <div
      v-for="ip in sourceIPs"
      :key="ip"
      class="flex items-center gap-2"
    >
      <TagIcon class="h-4 w-4 shrink-0" />
      <span class="min-w-28 break-all">
        {{ ip }}
      </span>
      <TextInput
        class="w-40 min-w-24 max-sm:flex-1"
        v-model="sourceIPLabelMap[ip]"
      />
      <button
        class="btn btn-circle btn-sm"
        @click="() => handlerLabelRemove(ip)"
      >
        <MinusCircleIcon class="h-4 w-4" />
      </button>
    </div>
    <div class="flex w-full items-center gap-2">
      <TextInput
        class="w-36 flex-1 sm:max-w-40"
        v-model="newLabelForIP.ip"
        @click="handlerIPInputFocus"
        placeholder="IP"
      />
      <ArrowRightCircleIcon class="h-4 w-4 shrink-0" />
      <TextInput
        class="w-24 sm:w-32"
        v-model="newLabelForIP.label"
        :placeholder="$t('label')"
      />
      <button
        class="btn btn-circle btn-sm"
        @click="handlerLabelAdd"
      >
        <PlusCircleIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTooltip } from '@/helper/tooltip'
import { connections } from '@/store/connections'
import { sourceIPLabelMap } from '@/store/settings'
import {
  ArrowRightCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import { uniq } from 'lodash'
import { computed, reactive } from 'vue'
import TextInput from '../common/TextInput.vue'

const { showTip, destroyTip } = useTooltip()

const handlerIPInputFocus = (e: Event) => {
  const source = uniq(connections.value.map((conn) => conn.metadata.sourceIP))
    .filter(Boolean)
    .sort()

  if (!source.length) {
    return
  }
  const ipMenu = document.createElement('div')

  for (const ip of source) {
    const ipItem = document.createElement('div')

    ipItem.className = 'cursor-pointer p-1 transition-transform hover:scale-105'

    ipItem.textContent = ip
    ipItem.addEventListener('click', () => {
      newLabelForIP.ip = ip
      destroyTip()
    })
    ipMenu.appendChild(ipItem)
  }

  showTip(e, ipMenu, {
    placement: 'bottom',
    trigger: 'click',
    interactive: true,
    arrow: false,
  })
}
const sourceIPs = computed(() => {
  return Object.keys(sourceIPLabelMap.value).sort()
})

const newLabelForIP = reactive({
  ip: '',
  label: '',
})

const handlerLabelAdd = () => {
  sourceIPLabelMap.value[newLabelForIP.ip] = newLabelForIP.label
  newLabelForIP.ip = ''
  newLabelForIP.label = ''
}

const handlerLabelRemove = (ip: string) => {
  Reflect.deleteProperty(sourceIPLabelMap.value, ip)
  sourceIPLabelMap.value = { ...sourceIPLabelMap.value }
}
</script>
