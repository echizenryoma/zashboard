<template>
  <div class="h-full overflow-hidden md:p-2">
    <div class="md:card mx-auto flex h-full flex-col md:flex-row md:gap-2">
      <!-- 左侧菜单 -->
      <div
        ref="menuRef"
        class="scrollbar-hidden border-base-300 max-md:border-b md:h-full md:w-64 md:border-r md:p-2"
        @touchstart.passive.stop
        @touchmove.passive.stop
        @touchend.passive.stop
      >
        <ul class="menu w-full flex-row md:flex-col md:gap-2">
          <li
            v-for="item in menuItems"
            :key="item.key"
            class="flex-shrink-0 max-md:flex-1 md:w-full"
          >
            <a
              class="py-2 whitespace-nowrap max-md:flex max-md:justify-center max-md:px-4"
              :class="[activeMenuKey === item.key ? 'menu-active' : '']"
              @click="handleMenuClick(item.key)"
            >
              <component
                :is="item.icon"
                class="h-5 w-5"
              />
              <span class="hidden md:block">
                {{ $t(item.label) }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 右侧内容区域 -->
      <div
        ref="scrollContainerRef"
        class="max-w-7xl flex-1 overflow-x-hidden overflow-y-auto"
      >
        <div class="grid grid-cols-1 gap-2">
          <div
            v-if="isMiddleScreen"
            class="flex flex-col gap-4 p-2"
          >
            <div
              v-for="item in menuItems"
              :key="item.key"
              :id="`item-${item.key}`"
              :data-key="item.key"
              class="card"
            >
              <component :is="item.component" />
            </div>
          </div>
          <component
            v-else
            :is="menuItems.find((item) => item.key === activeMenuKey)?.component"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackendSettings from '@/components/settings/BackendSettings.vue'
import ConnectionsSettings from '@/components/settings/ConnectionsSettings.vue'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import OverviewSettings from '@/components/settings/OverviewSettings.vue'
import ProxiesSettings from '@/components/settings/ProxiesSettings.vue'
import { isMiddleScreen } from '@/helper/utils'
import { splitOverviewPage } from '@/store/settings'
import {
  ArrowsRightLeftIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  HomeIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline'
import { useIntersectionObserver, useSwipe } from '@vueuse/core'
import type { Component } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

type MenuItem = {
  key: MenuKey
  label: string
  icon: Component
  component: Component
}

enum MenuKey {
  general = 'generalSettings',
  backend = 'backendSettings',
  proxies = 'proxySettings',
  connections = 'connectionSettings',
  overview = 'overviewSettings',
}

const route = useRoute()
const activeMenuKey = ref(splitOverviewPage.value ? MenuKey.general : MenuKey.overview)
const menuRef = ref<HTMLDivElement>()
const scrollContainerRef = ref<HTMLDivElement>()
const menuItems = computed<MenuItem[]>(() => {
  const overviewItem = {
    key: MenuKey.overview,
    label: 'overviewSettings',
    icon: CubeTransparentIcon,
    component: OverviewSettings,
  }
  const items = [
    {
      key: MenuKey.general,
      label: 'zashboardSettings',
      icon: HomeIcon,
      component: GeneralSettings,
    },
    {
      key: MenuKey.backend,
      label: 'backendSettings',
      icon: ServerIcon,
      component: BackendSettings,
    },
    {
      key: MenuKey.proxies,
      label: 'proxySettings',
      icon: GlobeAltIcon,
      component: ProxiesSettings,
    },
    {
      key: MenuKey.connections,
      label: 'connectionSettings',
      icon: ArrowsRightLeftIcon,
      component: ConnectionsSettings,
    },
  ]

  if (splitOverviewPage.value) {
    items.push(overviewItem)
  } else {
    items.unshift(overviewItem)
  }
  return items
})

const getItemRef = (key: MenuKey) => {
  return document.getElementById(`item-${key}`)
}

const handleMenuClick = (key: MenuKey) => {
  activeMenuKey.value = key

  if (isMiddleScreen.value) {
    const index = menuItems.value.findIndex((item) => item.key === key)
    if (index !== -1) {
      getItemRef(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
// 滑动切换菜单功能
const { direction } = useSwipe(menuRef, { threshold: 75 })

const getCurrentMenuIndex = () => {
  return menuItems.value.findIndex((item) => item.key === activeMenuKey.value)
}

const getNextMenuKey = () => {
  const currentIndex = getCurrentMenuIndex()
  if (currentIndex === -1) return
  const nextIndex = (currentIndex + 1) % menuItems.value.length
  handleMenuClick(menuItems.value[nextIndex].key)
}

const getPrevMenuKey = () => {
  const currentIndex = getCurrentMenuIndex()
  if (currentIndex === -1) return
  const prevIndex = (currentIndex - 1 + menuItems.value.length) % menuItems.value.length
  handleMenuClick(menuItems.value[prevIndex].key)
}

const isInputActive = () => {
  const activeEl = document.activeElement
  return activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
}

watch(direction, () => {
  if (!isMiddleScreen.value) return

  if (
    document.querySelector('dialog:modal') ||
    isInputActive() ||
    window.getSelection()?.toString()?.length
  )
    return

  if (direction.value === 'right') {
    getPrevMenuKey()
  } else if (direction.value === 'left') {
    getNextMenuKey()
  }
})

// 移动端滚动时自动激活菜单
const visibilityRatios = ref<Map<MenuKey, number>>(new Map())
let updateTimer: ReturnType<typeof setTimeout> | null = null

const updateActiveMenuByVisibility = () => {
  if (!isMiddleScreen.value || !scrollContainerRef.value) return

  // 找到最可见的元素
  let maxRatio = 0
  let mostVisibleKey: MenuKey | null = null

  visibilityRatios.value.forEach((ratio, key) => {
    if (ratio > maxRatio) {
      maxRatio = ratio
      mostVisibleKey = key
    }
  })

  // 如果找到了最可见的元素且可见度超过阈值（30%），更新激活菜单
  if (mostVisibleKey && maxRatio >= 0.3) {
    if (mostVisibleKey !== activeMenuKey.value) {
      activeMenuKey.value = mostVisibleKey
    }
  }
}

// 使用防抖优化性能
const debouncedUpdateActiveMenu = () => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  updateTimer = setTimeout(() => {
    updateActiveMenuByVisibility()
    updateTimer = null
  }, 100)
}

// 存储 IntersectionObserver 的停止函数
const intersectionObservers: Array<{ stop: () => void }> = []

// 设置滚动监听和菜单自动激活
const setupIntersectionObservers = () => {
  // 清理旧的观察器
  intersectionObservers.forEach((observer) => observer.stop())
  intersectionObservers.length = 0
  visibilityRatios.value.clear()

  if (!isMiddleScreen.value || !scrollContainerRef.value) return

  nextTick(() => {
    menuItems.value.forEach((item) => {
      const itemRef = getItemRef(item.key)
      const itemKey = item.key
      if (!itemRef || !itemKey) return

      const { stop } = useIntersectionObserver(
        itemRef,
        ([entry]) => {
          const ratio = entry.intersectionRatio
          if (ratio > 0) {
            visibilityRatios.value.set(itemKey, ratio)
          } else {
            visibilityRatios.value.delete(itemKey)
          }
          debouncedUpdateActiveMenu()
        },
        {
          root: scrollContainerRef.value,
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        },
      )
      intersectionObservers.push({ stop })
    })
  })
}

// 监听菜单项变化和屏幕尺寸变化，重新设置观察器
watch(
  [menuItems, isMiddleScreen],
  () => {
    nextTick(() => {
      setupIntersectionObservers()
    })
  },
  { flush: 'post' },
)

onMounted(() => {
  setupIntersectionObservers()

  requestAnimationFrame(async () => {
    const scrollTo = route.query.scrollTo as string
    if (scrollTo) {
      const element = document.getElementById(scrollTo)
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
    }
  })
})
</script>
