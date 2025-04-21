<script lang="ts" setup>
import type { ConnectionLineProps, GraphNode } from '@vue-flow/core'

import { useVueFlow, VueFlow } from '@vue-flow/core'
// import { resolveDynamicComponent } from 'vue'
import "~/assets/css/_node.scss";
definePageMeta({
  layout: 'workflow',
})
useHead({
  title: 'AI 工作流',
  meta: [
    {
      name: 'description',
      content: ' AI 工作流',
    },
  ],
})

const { nodes, edges } = storeToRefs(useWorkflowStore())

const {
  onConnect,
  findNode,
  findEdge,

  onEdgeContextMenu,

  onNodeClick,
  onNodesChange,
  onEdgesChange,
  removeEdges,
  removeNodes,
  onPaneReady,
 
  

  // connectionLineOptions,
} = useVueFlow({
  nodes: nodes.value,
  edges: edges.value,
  // create links automatically
  // not what we want really
  autoConnect: false,
  // disable connecting by clicking
  connectOnClick: false,
})
const nodeComponentMap = useNodeComponentMap()
onConnect((connection) => {
  let sourceNodeId = connection.source
  let targetNodeId = connection.target

  let sourceNode = findNode(sourceNodeId) as GraphNode

  let targetNode = findNode(targetNodeId) as GraphNode

  // 🔁 检查并纠正方向：始终是 output ➜ input
  if (sourceNode.type === 'input' && targetNode.type === 'output') {
    // 反向
    const temp = sourceNodeId
    sourceNodeId = targetNodeId
    targetNodeId = temp
    const tempNode = sourceNode
    sourceNode = targetNode
    targetNode = tempNode
  }

  // 获取节点的父级ID
  const sourceParentNodeId = sourceNode.parentNode
  const targetParentNodeId = targetNode.parentNode

  // 防止同一父节点的连接
  if (sourceParentNodeId === targetParentNodeId) {
    console.log('Invalid connection: Nodes cannot connect within the same parent.')
    return
  }

  // 获取源端口和目标端口类型
  const sourcePortType = sourceNode.type
  const targetPortType = targetNode.type

  console.log('sourcePortType', sourcePortType)
  console.log('targetPortType', targetPortType)

  // 如果是 `output` 连接到 `input`，允许连接
  if (targetPortType === 'input' && (sourcePortType === 'input' || sourcePortType === 'output')) {
    const id = `from-${sourceNodeId}-to-${targetNodeId}`
    const edge = findEdge(id)

    if (edge) {
      console.log('Edge already exists:', id)
      return
    }

    const targetColor = targetNode.data.color
    const sourceColor = sourceNode.data.color
    const sourceParent = sourceNode.parentNode
    const targetParent = targetNode.parentNode

    // addEdges([
    //   {
    //     id,
    //     type: 'custom',
    //     source: sourceNodeId,
    //     target: targetNodeId,
    //     data: { targetColor, sourceColor, sourceParent, targetParent },
    //     style: { 'stroke-width': '2px' },
    //   },
    // ])
    edges.value.push(
      {
        id,
        type: 'custom',
        source: sourceNodeId,
        target: targetNodeId,
        data: { targetColor, sourceColor, sourceParent, targetParent },
        style: { 'stroke-width': '2px' },
      },
    )
  }
  else {
    console.log('Invalid connection: Only output can connect to input.')
  }
})

onEdgeContextMenu((event) => {
  event.event.preventDefault()
  // removeEdges([event.edge.id])
  // edges.value = edges.value.filter(edge => edge.id !== event.edge.id)
})
onPaneReady((i) => i.fitView())
const connectionColor = ref('white')

const target = ref({ segments: 15, updateOnDrag: true })
onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'position' && change.position) {
      const node = nodes.value.find(n => n.id === change.id)
      if (node) {
        node.position = change.position // ✅ 同步拖动后的位置
      }
    }

    if (change.type === 'remove') {
      // ✅ collect descendants BEFORE removing anything
      const allDescendants = collectAllDescendants(change.id, nodes.value)

      const toDelete = [change.id, ...allDescendants]
      removeNodes(toDelete)
      removeEdges(toDelete.map(id => `from-${id}-to-`)) // 删除所有与该节点相关的边
      // ✅ 告诉 vueFlow 也删掉
      // vueFlow.removeNodes(toDelete)

      // ✅ 再更新响应式 store
      nodes.value = nodes.value.filter(n => !toDelete.includes(n.id))
      edges.value = edges.value.filter(
        e => !toDelete.includes(e.source) && !toDelete.includes(e.target),
      )

      // console.log('all nodes:', nodes.value.map(n => ({ id: n.id, parentNode: n.parentNode, type: n.type })))
    }
  })
})

onEdgesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'remove') {
      // edges.value = edges.value.filter(edge => edge.id !== change.id)
      edges.value = edges.value.filter(edge => edge.id !== change.id)
    }
  })
})
function collectAllDescendants(parentId: string, allNodes: any[]) {
  const descendants: string[] = []

  function recurse(currentId: string) {
    const children = allNodes.filter(n => n.parentNode === currentId)
    for (const child of children) {
      descendants.push(child.id)
      recurse(child.id) // 递归查找下一层
    }
  }

  recurse(parentId)
  return descendants
}
const selectedNodeId = ref<string | null>(null)
onNodeClick(({ node }) => {
  selectedNodeId.value = node.id
})

onMounted(()=>{
  // console.log(nodeComponentMap['input/chat-input'])
})
// 根据 nodes 数量动态缩放
watch(
  () => nodes.value.length,
  (count) => {
    const baseZoom = 1
    const maxNodes = 100
    const zoom = Math.max(0.2, baseZoom - count / maxNodes)
    setZoom(zoom)
  },
  { immediate: true }
)
</script>

<template>
  <div class="font-[HLFont-Normal]">
    <ClientOnly>
      <div
        class="w-screen h-screen  " style="background-image: radial-gradient(circle, rgb(249 250 251 / 0.1)  2px, transparent 2px);
background-size: 50px 50px; background-color: #1e1e1e;"
      >
        <VueFlow :nodes="nodes" :edges="edges"   :default-viewport="{ zoom: 0.8 }"   :max-zoom="4" :min-zoom="0.1">
          <template #node-custom="props">
            <!-- 业务节点 -->
            <component

              :is="nodeComponentMap[props.data.component]"
              :id="props.id"
              :data="props.data"
              :class="{ 'shadow-[rgba(219,219,219,0.66)] shadow-lg': props.id === selectedNodeId }"
            />
            
          </template>
          <template #edge-custom="props">
            <WorkflowEdge v-bind="props" :segments="target.segments" :update-on-drag="target.updateOnDrag" />
          </template>
          <template #connection-line="props">
            <WorkflowConnection :source-x="(props as ConnectionLineProps).sourceX" :source-y="(props as ConnectionLineProps).sourceY" :target-x="(props as ConnectionLineProps).targetX" :target-y="(props as ConnectionLineProps).targetY" :color="connectionColor" />
          </template>
        </VueFlow>
      </div>
    </ClientOnly>
  </div>
</template>

<style>

@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
