import type { Edge, Node } from '@vue-flow/core'
import { defineStore } from 'pinia'
import Workflow from '~~/models/Workflow'

export const useWorkflowStore = defineStore('workflow', () => {

  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const executionErrorNodeIds = ref<string[]>([])
  const currentWorkflow = ref<Workflow>()
  const capturingScreenshotMode = ref(true)
  const triggerNodeComponentName = ref()

  const selectedNodeId = ref<string | null>(null)


  return {
    nodes,
    edges,
    capturingScreenshotMode,
    triggerNodeComponentName,
    currentWorkflow,
    executionErrorNodeIds,
    selectedNodeId


  }
})
