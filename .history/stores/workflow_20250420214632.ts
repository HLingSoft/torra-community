import type { Edge, Node, XYPosition } from '@vue-flow/core'
import { defineStore } from 'pinia'
import Workflow from '~/models/Workflow'
import { useVueFlow } from '@vue-flow/core'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const currentWorkflow=ref<Workflow>()
  const vueFlowRef = ref<HTMLElement | null>(null)
  function addNode(component: string) {
    const id = nanoid()
    const {  project } = useVueFlow()
   // 1. 获取 vue-flow 容器的屏幕位置
  //  let position: XYPosition = { x: 0, y: 0 }
  //  if(vueFlowRef.value){
  //   const { left, top } = vueFlowRef.value.getBoundingClientRect()
  //   // 2. 转换为画布坐标
  //   position = project({ x: left, y: top })
  //  } 
   

   // 2. 转换为画布坐标
   const position = project({ x: 0, y: 0 })
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
    vueFlowRef,
    currentWorkflow
    
  }
})
