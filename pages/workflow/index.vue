<script lang="ts" setup>
import type { ConnectionLineProps, GraphNode, VueFlowStore } from '@vue-flow/core'
// import { Controls } from '@vue-flow/controls'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import "~/assets/css/_node.scss";
const history = useWorkflowHistoryStore()
definePageMeta({
  layout: 'workflow',
})
useHead({
  title: '企业级AI工作流',
  meta: [
    // 基本描述
    { name: 'description', content: '企业级AI工作流，助力企业智能自动化，提升效率，降低成本。' },
    { name: 'keywords', content: 'AI工作流, 企业自动化, 智能工作流, 企业级AI, 业务流程自动化' },

  ],
})
const { project } = useVueFlow()
const { nodes, edges, triggerNodeComponentName } = storeToRefs(useWorkflowStore())

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

} = useVueFlow({
  nodes: nodes.value,
  edges: edges.value,
  autoConnect: false,
  connectOnClick: false,
})


const onFlowInit = async (_instance: VueFlowStore) => {


}




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

  // console.log('sourcePortType', sourcePortType)
  // console.log('targetPortType', targetPortType)

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
    // history.snapshot('记录连接后的状态') // 记录连接后的状态
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

const connectionColor = ref('white')

const target = ref({ segments: 15, updateOnDrag: true })
onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'position' && change.position) {
      const node = nodes.value.find(n => n.id === change.id)
      if (node) {
        node.position = change.position // ✅ 同步拖动后的位置
        // fitView() // ✅ 拖动后自动适应视图
      }
    }

    if (change.type === 'remove') {
      // ✅ collect descendants BEFORE removing anything
      const allDescendants = collectAllDescendants(change.id, nodes.value)

      const toDelete = [change.id, ...allDescendants]
      removeNodes(toDelete)
      removeEdges(toDelete.map(id => `from-${id}-to-`)) // 删除所有与该节点相关的边


      // ✅ 再更新响应式 store
      nodes.value = nodes.value.filter(n => !toDelete.includes(n.id))
      edges.value = edges.value.filter(
        e => !toDelete.includes(e.source) && !toDelete.includes(e.target),
      )


    }
  })

  // history.snapshot('删除节点') // 记录删除后的状态
})

onEdgesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'remove') {

      edges.value = edges.value.filter(edge => edge.id !== change.id)
      // history.snapshot('删除边') // 记录删除后的状态
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


// // 单独封装 zoom 调整逻辑
// const adjustZoom = (count: number) => {
//   const baseZoom = 1
//   const maxNodes = 20
//   const zoom = Math.max(0.35, baseZoom - count / maxNodes)



//   // setViewport?.({ zoom, x: 400, y: 400 }, { duration: 500 })
// }

watch(triggerNodeComponentName, () => {
  // console.log('triggerNodeComponentName', triggerNodeComponentName.value)
  if (triggerNodeComponentName.value && !_.isEmpty(triggerNodeComponentName.value)) {
    history.snapshot('添加触发器节点')
    const position = project({ x: 140, y: 140 }) // 👈 关键位置
    nodes.value.push({
      id: nanoid(),
      type: 'custom',
      position,
      data: {
        component: triggerNodeComponentName.value,
      },
    })

    triggerNodeComponentName.value = ''
  }
})
// watch(() => history.flowKey, () => {
//   nextTick(() => {
//     onNodesChange([{ type: 'reset' }])
//   })
// })
</script>

<template>
  <div class="">
    <ClientOnly>
      <div class="w-screen h-screen  ">
        <VueFlow @init="onFlowInit" fit-view-on-init :nodes="nodes" :edges="edges" :default-viewport="{ zoom: 0.8 }" :max-zoom="2" :min-zoom="0.1">
          <Background />
          <template #node-custom="props">
            <!-- 业务节点 -->
            <component :is="nodeComponentMap[props.data.component]" :id="props.id" :data="props.data" :class="{ 'shadow-[rgba(219,219,219,0.66)] shadow-lg': props.id === selectedNodeId }" />

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
