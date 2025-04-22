import type { Edge, Node } from '@vue-flow/core'
import { defineStore } from 'pinia'
import Workflow from '~/models/Workflow'
// import { useVueFlow } from '@vue-flow/core'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const currentWorkflow = ref<Workflow>()

  const triggerNodeComponentName = ref()

  return {
    nodes,
    edges,
    // addNode,
    triggerNodeComponentName,
    currentWorkflow
    
  }
})
