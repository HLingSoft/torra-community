<script lang="ts" setup>
import type { ConnectionLineProps, OnConnectStartParams, EdgeChange, Node, NodeChange, Connection, VueFlowStore } from '@vue-flow/core'

import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { nanoid } from 'nanoid';
import { MiniMap } from '@vue-flow/minimap'
import { promiseTimeout } from '@vueuse/core';

 
definePageMeta({
  layout: 'workflow',
})
useHead({
  title: '企业级AI智能体和工作流平台',
  meta: [
    // 基本描述
    { name: 'description', content: '企业级AI工作流，助力企业智能自动化，提升效率，降低成本。' },
    { name: 'keywords', content: 'AI工作流, 企业自动化, 智能工作流, 企业级AI, 业务流程自动化' },

  ],
})

const { nodes, edges, triggerNodeComponentName, currentWorkflow, selectedNodeId } = storeToRefs(useWorkflowStore())

watch(() => currentWorkflow.value?.objectId, async (objectId, oldObjectId) => {
  if (objectId) {
    // adjustZoomByNodeCount()
    edges.value = []
    nodes.value = []

    await nextTick()
    // 重新加载工作流时，自动缩放视图
    edges.value = currentWorkflow.value?.edges || []
    nodes.value = currentWorkflow.value?.nodes || []

    await nextTick()
    await promiseTimeout(1000) // 等待 VueFlow 完成渲染
    console.log('重新加载工作流，自动缩放视图')
    userAdjusted.value = false // 重置用户调整标志
    adjustZoomByNodeCount()
    // fitView({ duration: 1000 }) // 确保视图适应新节点

  }
}, { immediate: true })


// const currentNodes = ref<Node[]>([])
// const currentEdges = ref<Edge[]>([])

const { project, addNodes, addEdges, applyNodeChanges, applyEdgeChanges } = useVueFlow()
const flowInstance = ref<VueFlowStore>()
// 记录是否用户手动拖过视口，如果手动拖过就不再自动缩放
const userAdjusted = ref(false)

function onFlowInit(instance: VueFlowStore) {
  flowInstance.value = instance
  // 初次加载时，节点数量很少，手动缩一下
  adjustZoomByNodeCount()
}




const nodeComponentMap = useNodeComponentMap()


const connectionColor = ref('white')


// ---- add connection ---------------------------------------------------------
function handleConnect(conn: Connection) {

  addEdges({
    ...conn,
    type: 'custom',
    source: conn.source,
    target: conn.target,
    data: {
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
    },

  })



}
// ---- node changes -----------------------------------------------------------

async function handleNodesChange(changes: NodeChange[]) {

  // 无删除时走极速通道
  if (!changes.some(c => c.type === 'remove')) {

    nodes.value = applyNodeChanges(changes)
    return
  }

  const filtered: NodeChange[] = []
  for (const ch of changes) {
    if (ch.type !== 'remove') {
      filtered.push(ch)
      continue
    }
    const ok = await useConfirm({
      title: '删除节点',
      description: '确定删除该节点及关联连线吗？',
      confirmText: '确定',
      cancelText: '取消',
    })
    if (ok) {
      filtered.push(ch)

      adjustZoomByNodeCount()
    }
  }
  nodes.value = applyNodeChanges(filtered)



}
// ---- edge changes -----------------------------------------------------------
async function handleEdgesChange(changes: EdgeChange[]) {
  const removedEdges = changes.filter(c => c.type === 'remove')
  const otherChanges = changes.filter(c => c.type !== 'remove')

  const nodeIds = new Set(nodes.value.map(n => n.id))

  const manuallyRemovedEdges: EdgeChange[] = []
  const autoRemovedEdges: EdgeChange[] = []

  for (const edgeChange of removedEdges) {
    const edge = edges.value.find(e => e.id === edgeChange.id)
    if (edge && nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      // ✅ 用户手动删除，弹出确认框
      const ok = await useConfirm({
        title: '删除连线',
        description: '确定要删除这条连线吗？',
        confirmText: '删除',
        cancelText: '取消',
      })
      if (ok) {
        manuallyRemovedEdges.push(edgeChange)
      }
    } else {
      // 🧼 自动删除（节点已不存在）
      autoRemovedEdges.push(edgeChange)
    }
  }

  const finalChanges: EdgeChange[] = [
    ...otherChanges,
    ...autoRemovedEdges,
    ...manuallyRemovedEdges,
  ]

  edges.value = applyEdgeChanges(finalChanges)

  // console.log('✅ 手工删除的 edges:', manuallyRemovedEdges.length)
  // console.log('🧼 自动删除的 edges:', autoRemovedEdges.length)

}


function handleNodeClick({ node }: { node: Node }) {
  selectedNodeId.value = node.id
}

const onPaneClick = () => {
  selectedNodeId.value = ''
}

watch(triggerNodeComponentName, () => {

  if (triggerNodeComponentName.value && !_.isEmpty(triggerNodeComponentName.value)) {
    const nodeCount = nodes.value.length || 0
    const perRow = 10 // 每行10个节点自动换行
    const x = 140 + 20 * (nodeCount % perRow)
    const y = 140 + 10 * (nodeCount % perRow)
    const position = project({ x, y })
    const newNode: Node = {
      id: nanoid(),
      type: 'custom',
      position,
      zIndex: 999,
      data: {
        component: triggerNodeComponentName.value,
      },
    }
    addNodes(newNode)



    triggerNodeComponentName.value = ''
    adjustZoomByNodeCount()

  }
})





function onConnectStart(params: OnConnectStartParams) {
  console.log('on connect start', params.handleId)
  const selector = `[data-handleid="${params.handleId}"]`
  const handleEl = document.querySelector<HTMLElement>(selector)
  if (handleEl) {

    const color = window.getComputedStyle(handleEl).backgroundColor

    connectionColor.value = color
  } else {
    connectionColor.value = 'white' // 默认颜色 
  }

}

function onConnectEnd() {
  // connectingSourceInfo.value = null
}

// 根据节点数决定缩放比例
function adjustZoomByNodeCount() {
  if (!flowInstance.value || userAdjusted.value) return
  const count = nodes.value.length
  // 只有 1～2 个节点时，就缩到 0.5
  if (count <= 4) {
    flowInstance.value.fitView({ padding: 0.5 }) // 先自动包住
    flowInstance.value.zoomTo(0.5, { duration: 1000 }) // 然后缩放到 0.5
  } else {
    // 节点多时，就让它自动填满
    flowInstance.value.fitView({ padding: 0.1 })
    // flowInstance.value.zoomTo(0.1, { duration: 1000 }) // 然后缩放到 0.5
  }
}





</script>

<template>
  <div class="w-full h-full flex flex-col relative">
    <ClientOnly>

      <VueFlow @init="onFlowInit" style="width: 100%; height: 100%;" @pane-click="onPaneClick" :apply-default="false" :auto-pan-on-node-drag="true" @move="userAdjusted = true" @connect-start="onConnectStart" @connect-end="onConnectEnd" :nodes-draggable="true" :nodes-connectable="true" @node-click="handleNodeClick" @connect="handleConnect" @edges-change="handleEdgesChange" @nodes-change="handleNodesChange" v-model:nodes="nodes" v-model:edges="edges" :default-viewport="{ zoom: 0.5 }" :max-zoom="2" :min-zoom="0.1" :pan-on-drag="true" :zoom-on-scroll="true">
        <Background class="dark" />
        <MiniMap   node-color="#23272f" node-stroke-color="#434b57" mask-color="rgba(30,32,36,0.9)" class="rounded-lg overflow-hidden shadow" />
        <template #node-custom="props">


          <component :key="props.id" v-bind="props" :is="nodeComponentMap[props.data.component]" :id="props.id" :data="props.data" />

        </template>
        <template #edge-custom="props">
          <WorkflowEdge v-bind="props" :source="props.source" :target="props.target" :sourceHandle="props.data.sourceHandle" :targetHandle="props.data.targetHandle" :update-on-drag="true" />
        </template>
        <template #connection-line="props">
          <WorkflowConnection :source-x="(props as ConnectionLineProps).sourceX" :source-y="(props as ConnectionLineProps).sourceY" :target-x="(props as ConnectionLineProps).targetX" :target-y="(props as ConnectionLineProps).targetY" :color="connectionColor" />
        </template>
      </VueFlow>

    </ClientOnly>
  </div>
</template>

<style>

@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css"; 
@import "@vue-flow/minimap/dist/style.css";



</style>
