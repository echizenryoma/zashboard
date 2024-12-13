import { fetchLogsAPI } from '@/api'
import { LOG_LEVEL } from '@/config'
import type { Log, LogWithSeq } from '@/types'
import { useStorage } from '@vueuse/core'
import { throttle } from 'lodash'
import { ref, watch } from 'vue'
import { logRetentionLimit, sourceIPLabelMap } from './settings'

export const logs = ref<LogWithSeq[]>([])
export const logFilter = ref('')
export const isPaused = ref(false)
export const logLevel = useStorage<string>('config/log-level', LOG_LEVEL.Info)

let cancel: () => void
let logsTemp: LogWithSeq[] = []

const sliceLogs = throttle(() => {
  logs.value = logsTemp.concat(logs.value).slice(-logRetentionLimit.value)
  logsTemp = []
}, 500)

export const initLogs = () => {
  cancel?.()
  logs.value = []
  logsTemp = []

  let idx = 1
  const ws = fetchLogsAPI<Log>({
    level: logLevel.value,
  })
  const unwatch = watch(ws.data, (data) => {
    if (!data) return

    if (isPaused.value) {
      idx++
      return
    }

    for (const ip in sourceIPLabelMap.value) {
      if (data.payload.includes(ip)) {
        data.payload = data.payload.replace(ip, `${ip}(${sourceIPLabelMap.value[ip]})`)
        break
      }
    }

    logsTemp.unshift({
      ...data,
      time: new Date().valueOf(),
      seq: idx++,
    })

    sliceLogs()
  })

  cancel = () => {
    unwatch()
    ws.close()
  }
}
