// stores/workflowHistory.ts
import { defineStore } from 'pinia'
import type { Edge, Node } from '@vue-flow/core'
 
 

interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
}

export const useWorkflowHistoryStore = defineStore('workflowHistory', () => {
  const undoStacks = ref<Record<string, WorkflowState[]>>({})
  const redoStacks = ref<Record<string, WorkflowState[]>>({})
 
  const { currentWorkflow,nodes,edges } =storeToRefs(useWorkflowStore()) 
  const workflowId = computed(() => currentWorkflow.value?.objectId )
  const maxStackSize = 30

  function snapshot(label = '') {
    const id = workflowId.value
    if (!id) return
  
    if (!undoStacks.value[id]) undoStacks.value[id] = []
    if (!redoStacks.value[id]) redoStacks.value[id] = []
  
    const current = {
      nodes: _.cloneDeep(nodes.value),
      edges: _.cloneDeep(edges.value),
    }
  
    const stack = undoStacks.value[id]
    const last = stack[stack.length - 1]
  
    if (_.isEqual(current, last)) return
  
    stack.push(current)
    if (stack.length > maxStackSize) stack.shift()
    redoStacks.value[id] = []
  
    
  }
  function undo() {
    console.log('undo')
    const id = workflowId.value
    if (!id) return
    const stack = undoStacks.value[id]
    const redoStack = redoStacks.value[id]
  
    if (!stack || stack.length <= 1) return
  
    const current = stack.pop()!
    console.log('current', current)
    redoStack.push(_.cloneDeep(current))
  
    const prev = _.cloneDeep(stack[stack.length - 1])
    nodes.value.splice(0, nodes.value.length, ...prev.nodes)
    edges.value.splice(0, edges.value.length, ...prev.edges)
    console.log(`[undo] stack size: ${stack.length}`)
    console.log(`[undo] redo stack size: ${redoStack.length}`)
    
  }

  function redo() {
    const id = workflowId.value
    if (!id) return
  
    // const stack = undoStacks.value[id]
    const redoStack = redoStacks.value[id]
    console.log('redo', redoStack.length)
    if (!redoStack || redoStack.length === 0) return
  
    const next = redoStack.pop()!
    // stack.push(_.cloneDeep(next))
    // nodes.value=next.nodes  
    // edges.value=next.edges
  
    // console.log('[redo] restoring nodes:', next.nodes.map(n => n.id))
    // console.log('[redo] nodes.value before:', nodes.value.length)
  
    nodes.value.splice(0, nodes.value.length, ...next.nodes)
    edges.value.splice(0, edges.value.length, ...next.edges)
  
    console.log('[redo] nodes.value after:', nodes.value.length)
    
  }

  function clear() {
    const id = workflowId.value
    if (!id) return
    undoStacks.value[id] = []
    redoStacks.value[id] = []
  }

  const canUndo = computed(() => {
    const id = workflowId.value
    if (!id) return false
    const stack = undoStacks.value[id]
    return stack && stack.length > 1
  })
  const canRedo = computed(() => {
    const id = workflowId.value
    if (!id) return false
    const redoStack = redoStacks.value[id]
    return redoStack && redoStack.length > 0
  })

  return {
 
    undoStacks,
    redoStacks,
    snapshot,
    undo,
    redo,
    clear,
    canUndo:false,
    canRedo:false,
  }
})
