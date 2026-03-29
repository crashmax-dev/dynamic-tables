<template>
  <component
    :is="current.component"
    v-if="current"
    v-bind="current.props"
    @close="close"
  />
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/use-dialog'

const { current, close } = useDialog()
</script>
