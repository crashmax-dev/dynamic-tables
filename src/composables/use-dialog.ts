import { markRaw, shallowRef } from 'vue'
import type { Component, VNode } from 'vue'

interface DialogState {
  component: Component
  props: Record<string, unknown>
}

const current = shallowRef<DialogState | null>(null)

export function useDialog() {
  function open(vnode: VNode) {
    current.value = {
      component: markRaw(vnode.type as Component),
      props: (vnode.props ?? {}) as Record<string, unknown>,
    }
  }

  function close() {
    current.value = null
  }

  return { open, close, current }
}
