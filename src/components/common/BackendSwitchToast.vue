<template>
  <Transition name="backend-switch">
    <div
      v-if="visible && activeBackend"
      class="pointer-events-none fixed inset-x-0 top-0 z-[100001] flex justify-end pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pr-[calc(0.75rem+env(safe-area-inset-right,0px))] pl-3"
    >
      <!-- 窄屏挤不下多行卡片,压成一行:后端名 + 状态,错误详情让位给重试按钮。 -->
      <div
        v-if="isMiddleScreen"
        class="bg-base-100/95 border-base-border pointer-events-auto flex w-full items-center gap-2 rounded-full border py-2 pr-2 pl-3 shadow-lg backdrop-blur"
      >
        <span
          v-if="status === 'probing'"
          class="loading loading-spinner loading-xs text-primary flex-none"
        ></span>
        <CheckCircleIcon
          v-else-if="status === 'connected'"
          class="text-success h-4 w-4 flex-none"
        />
        <ExclamationTriangleIcon
          v-else
          class="text-error h-4 w-4 flex-none"
        />

        <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ label }}</span>
        <span
          class="flex-none text-xs"
          :class="statusTextClass"
        >
          {{ statusText }}
        </span>
        <span
          v-if="status === 'connected'"
          class="text-base-content/50 flex-none text-xs"
        >
          {{ latency }} ms
        </span>

        <button
          v-if="status === 'failed'"
          class="btn btn-xs flex-none"
          @click="retry"
        >
          {{ $t('retry') }}
        </button>
        <button
          class="btn btn-circle btn-ghost btn-xs flex-none"
          @click="hide"
        >
          <XMarkIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        v-else
        class="bg-base-100/95 border-base-border pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border p-3 shadow-lg backdrop-blur"
      >
        <div
          class="w-1 flex-none rounded-full transition-colors"
          :class="accentClass"
        ></div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex items-center gap-2">
            <ArrowsRightLeftIcon class="text-base-content/50 h-4 w-4 flex-none" />
            <span class="text-base-content/50 flex-1 truncate text-xs">
              {{ $t('backendSwitched') }}
            </span>
            <button
              class="btn btn-circle btn-ghost btn-xs -mt-1 -mr-1"
              @click="hide"
            >
              <XMarkIcon class="h-3.5 w-3.5" />
            </button>
          </div>

          <div class="truncate text-sm font-medium">{{ label }}</div>
          <div
            v-if="url !== label"
            class="text-base-content/50 truncate text-xs"
          >
            {{ url }}
          </div>

          <div class="mt-1 flex items-center gap-2 text-xs">
            <template v-if="status === 'probing'">
              <span class="loading loading-spinner loading-xs text-primary flex-none"></span>
              <span class="text-base-content/70">{{ $t('backendConnecting') }}</span>
            </template>
            <template v-else-if="status === 'connected'">
              <CheckCircleIcon class="text-success h-4 w-4 flex-none" />
              <span class="text-success">{{ $t('backendReachable') }}</span>
              <span class="text-base-content/50">{{ latency }} ms</span>
              <BackendVersion
                v-if="version"
                class="ml-auto min-w-0 text-xs"
              />
            </template>
            <template v-else>
              <ExclamationTriangleIcon class="text-error h-4 w-4 flex-none" />
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="text-error">{{ $t('backendUnreachable') }}</span>
                <span
                  v-if="message"
                  class="text-base-content/50 line-clamp-2 break-all"
                >
                  {{ message }}
                </span>
              </div>
              <button
                class="btn btn-xs flex-none"
                @click="retry"
              >
                {{ $t('retry') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { startBackendSession } from '@/assembly/session'
import { backendProbe, version } from '@/assembly/version'
import { getLabelFromBackend, getUrlFromBackend, isMiddleScreen } from '@/helper/utils'
import { activeBackend, activeUuid } from '@/store/setup'
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackendVersion from './BackendVersion.vue'

// 有结论就该让位,连不上也一样 —— 提示只是提示,长期占着屏幕反而挡路;
// 失败多留一会儿,给用户看清原因、够到重试按钮的时间。
const AUTO_HIDE_DELAY = {
  connected: 2500,
  failed: 5000,
}

const { t } = useI18n()
const visible = ref(false)
let hideTimer = -1

const hide = () => {
  clearTimeout(hideTimer)
  visible.value = false
}

// 只在切换后端时出现:首次进入(watch 不 immediate)与刷新页面都不打扰。
watch(activeUuid, (uuid) => {
  clearTimeout(hideTimer)
  visible.value = Boolean(uuid)
})

// 探测结果属于上一个后端时不认,避免切换瞬间闪一下旧结论。
const probe = computed(() =>
  backendProbe.value?.uuid === activeUuid.value ? backendProbe.value : undefined,
)
const status = computed(() => probe.value?.status ?? 'probing')
const latency = computed(() => probe.value?.latency ?? 0)
const message = computed(() => probe.value?.message ?? '')

const label = computed(() => (activeBackend.value ? getLabelFromBackend(activeBackend.value) : ''))
const url = computed(() => (activeBackend.value ? getUrlFromBackend(activeBackend.value) : ''))

const accentClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-success'
    case 'failed':
      return 'bg-error'
    default:
      return 'bg-primary'
  }
})

const statusText = computed(() => {
  switch (status.value) {
    case 'connected':
      return t('backendReachable')
    case 'failed':
      return t('backendUnreachable')
    default:
      return t('backendConnecting')
  }
})

const statusTextClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'text-success'
    case 'failed':
      return 'text-error'
    default:
      return 'text-base-content/70'
  }
})

watch(status, (value) => {
  if (!visible.value) return

  clearTimeout(hideTimer)
  if (value !== 'probing') {
    hideTimer = setTimeout(hide, AUTO_HIDE_DELAY[value])
  }
})

// 重试 = 对同一个后端重开一次会话:重新探测 + 重新拉数据 + 重连各常驻流。
// 探测会把状态打回 probing,上面的 watcher 借此把倒计时清掉,重来一轮。
const retry = () => {
  clearTimeout(hideTimer)
  startBackendSession()
}
</script>

<style scoped>
.backend-switch-enter-active,
.backend-switch-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.backend-switch-enter-from,
.backend-switch-leave-to {
  opacity: 0;
  transform: translateX(0.75rem);
}
</style>
