import type { Edge, Node, XYPosition } from '@vue-flow/core'
import { defineStore } from 'pinia'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])

  function addNode(component: string, position: XYPosition = { x: 100, y: 100 }) {
    const id = nanoid()

    const newNode: Node = {
      id,
      type: 'custom',
      position,
      data: {
        component,
      },
    }

    nodes.value.push(newNode)
    // vueFlow.addNodes([newNode])
    return id
  }

  return {
    nodes,
    edges,
    addNode,
  }
})
