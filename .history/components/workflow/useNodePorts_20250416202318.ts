import { Position, useVueFlow } from '@vue-flow/core'

export const createPortManager = () => {
  const vueFlow = useVueFlow()

  const { nodes } = storeToRefs(useWorkflowStore())

  const addInputPort = (parentNodeId: string, id: string, color: string, y: number) => {
    const newPortNode = {
      id,
      position: { x: 20, y },
      parentNode: parentNodeId,
      draggable: false,
      type: 'input',
      class: 'u-node-connector-input animate-fadeIn',
      targetPosition: Position.Left,
      style: { '--vf-node-color': color },
      data: { color },

    }
    nodes.value.push(newPortNode)
    vueFlow.addNodes([newPortNode])
  }

  const addOutputPort = (parentNodeId: string, id: string, color: string, y: number) => {
    const newPortNode = {
      id,
      position: { x: 375, y: y ?? 0 },
      parentNode: parentNodeId,
      draggable: false,
      type: 'output',
      class: 'u-node-connector-output animate-fadeIn',
      sourcePosition: Position.Right,

      style: { '--vf-node-color': color },
      data: { color },
    }
    nodes.value.push(
      newPortNode,

    )
    vueFlow.addNodes([newPortNode])
  }

  const updateNode = (id: string, data: any) => {
    nodes.value = nodes.value.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        }
      }
      return node
    },
    )
    vueFlow.updateNodeData(id, data, { replace: true })
  }

  const removePort = (id: string) => {
    nodes.value = nodes.value.filter(node => node.id !== id)
    vueFlow.removeNodes([id])
  }

  const updateNodePosition = (id: string, y: number) => {
    // console.log('[updateNodePosition] start', y)

    const updated = nodes.value.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          position: {
            x: node.position.x,
            y,
          },
        }
      }
      return node
    })

    vueFlow.setNodes(updated)
    nodes.value = updated

    // console.log('[updateNodePosition] updated nodes:', updated)
  }

  return {
    addInputPort,
    addOutputPort,
    updateNode,
    removePort,
    updateNodePosition,
  }
}
