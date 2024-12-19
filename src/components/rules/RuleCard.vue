<template>
  <div class="card mb-1 block p-2 text-sm">
    <span class="mr-2">{{ index }}:</span>
    <span class="mr-1 font-medium">{{ rule.type }}</span>
    <span class="mx-2">-></span>
    <span class="text-primary">{{ rule.proxy }}</span>
    <div>
      <span
        class="badge bg-base-200/60"
        v-if="rule.payload"
        >{{ rule.payload }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Rule } from '@/types'

defineProps<{
  rule: Rule
  index: number
}>()
</script>
