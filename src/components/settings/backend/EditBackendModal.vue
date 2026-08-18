<template>
  <DialogWrapper
    v-model="isVisible"
    :title="t('editBackendTitle')"
    @enter="canSave && handleSave()"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm">{{ t('selectBackend') }}</label>
        <select
          class="select select-sm w-full"
          v-model="selectedBackendUuid"
        >
          <option
            v-for="backend in backendList"
            :key="backend.uuid"
            :value="backend.uuid"
          >
            {{ getLabelFromBackend(backend) }}
          </option>
        </select>
      </div>

      <div
        v-if="editForm"
        class="flex flex-col gap-3"
      >
        <div class="divider my-0 text-xs">
          {{ editForm.type === 'singbox' ? t('singboxApi') : t('clashApi') }}
        </div>

        <div class="flex gap-2">
          <div class="flex w-24 flex-none flex-col gap-1">
            <label class="text-sm">{{ t('protocol') }}</label>
            <select
              class="select select-sm w-full"
              v-model="editForm.protocol"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
            </select>
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <label class="text-sm">{{ t('host') }}</label>
            <TextInput
              class="w-full"
              name="username"
              v-model="editForm.host"
              placeholder="127.0.0.1"
            />
          </div>
          <div class="flex w-20 flex-none flex-col gap-1">
            <label class="text-sm">{{ t('port') }}</label>
            <TextInput
              class="w-full"
              v-model="editForm.port"
              placeholder="9090"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <div
            v-if="editForm.type === 'clash'"
            class="flex min-w-0 flex-1 flex-col gap-1"
          >
            <label class="truncate text-sm">{{ t('secondaryPath') }} ({{ t('optional') }})</label>
            <TextInput
              class="w-full"
              v-model="editForm.secondaryPath"
              :placeholder="t('optional')"
            />
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <label class="truncate text-sm">{{ t('label') }} ({{ t('optional') }})</label>
            <TextInput
              class="w-full"
              v-model="editForm.label"
              :placeholder="t('label')"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm">{{ t('password') }}</label>
          <input
            type="password"
            class="input input-sm w-full"
            v-model="editForm.password"
          />
        </div>
      </div>

      <ReachabilityIndicator
        v-if="editForm"
        class="min-h-5"
        :status="reachability.status.value"
        :latency="reachability.latency.value"
        :message="reachability.message.value"
        @retry="reachability.retry"
      />

      <div class="flex justify-end gap-2">
        <button
          class="btn btn-sm"
          @click="handleCancel"
          :disabled="isSaving"
        >
          {{ t('cancel') }}
        </button>
        <button
          class="btn btn-primary btn-sm"
          @click="handleSave"
          :disabled="!canSave"
        >
          <span
            v-if="isSaving"
            class="loading loading-spinner loading-xs"
          ></span>
          {{ isSaving ? t('checking') : t('save') }}
        </button>
      </div>
    </div>
  </DialogWrapper>
</template>

<script setup lang="ts">
import { probeBackend } from '@/assembly/backend'
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import ReachabilityIndicator from '@/components/common/ReachabilityIndicator.vue'
import TextInput from '@/components/common/TextInput.vue'
import { useBackendReachability } from '@/composables/backendReachability'
import { showNotification } from '@/helper/notification'
import { getLabelFromBackend } from '@/helper/utils'
import { activeBackend, backendList, updateBackend } from '@/store/setup'
import type { Backend } from '@/types'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  defaultBackendUuid?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const editForm = ref<Omit<Backend, 'uuid'> | null>(null)
const selectedBackendUuid = ref('')
const isSaving = ref(false)

// 编辑期间实时探测:地址 / 密码改成什么样才通,改的时候就看得见。
const reachability = useBackendReachability(editForm)
const canSave = computed(() => reachability.status.value === 'online' && !isSaving.value)

const selectedBackend = computed(
  () => backendList.value.find((backend) => backend.uuid === selectedBackendUuid.value) || null,
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return
    selectedBackendUuid.value =
      props.defaultBackendUuid || activeBackend.value?.uuid || backendList.value[0]?.uuid || ''
  },
)

watch(
  selectedBackend,
  (backend) => {
    if (!backend) return
    editForm.value = {
      type: backend.type,
      protocol: backend.protocol,
      host: backend.host,
      port: backend.port,
      secondaryPath: backend.secondaryPath,
      password: backend.password,
      label: backend.label || '',
      disableUpgradeCore: backend.disableUpgradeCore || false,
      disableTunMode: backend.disableTunMode || false,
    }
  },
  { immediate: true },
)

const reset = () => {
  editForm.value = null
  selectedBackendUuid.value = ''
}

const handleCancel = () => {
  isVisible.value = false
  reset()
}

// 保存前再确认一次连通性。改错地址就存下去,下次打开面板才发现连不上,
// 那时已经离开这个表单了 —— 所以拦在这里,原因由上面的指示器给出。
const handleSave = async () => {
  if (!editForm.value || !selectedBackend.value) return
  isSaving.value = true

  try {
    const composed: Omit<Backend, 'uuid'> = { ...editForm.value }
    const result = await probeBackend({ uuid: selectedBackend.value.uuid, ...composed })

    if (!result.ok) {
      reachability.retry()
      return
    }

    updateBackend(selectedBackend.value.uuid, composed)
    showNotification({ content: t('backendConfigSaved'), type: 'alert-success' })
    isVisible.value = false
    reset()
    emit('saved')
  } catch (error) {
    showNotification({
      content: `${t('saveFailed')}: ${error}`,
      type: 'alert-error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>
