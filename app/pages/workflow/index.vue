<script lang="ts" setup>
import type { ConnectionLineProps, OnConnectStartParams, EdgeChange, Node, NodeChange, Connection, VueFlowStore } from '@vue-flow/core'
import dagre from 'dagre'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { nanoid } from 'nanoid';
import { MiniMap } from '@vue-flow/minimap'
import { promiseTimeout } from '@vueuse/core';

import { useMagicKeys } from '@vueuse/core'

// const history = useWorkflowHistoryStore()

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

const { project, addNodes, addEdges, setEdges, applyNodeChanges, applyEdgeChanges, setNodes, fitView } = useVueFlow()

const { nodes, edges, triggerNodeComponentName, currentWorkflow, capturingScreenshotMode, selectedNodeId } = storeToRefs(useWorkflowStore())
const { mini } = useMiniNode()
// 3) 存一份手动摆放的原始位置
const originalPositions = ref<Record<string, { x: number; y: number }>>({})
/** 首次加载 / 切工作流后，记录一下原始位置 **/
watch(
  // 把每个节点的 id 和 position 都打平成 [id, pos] 这样一个元组数组
  () => nodes.value.map(n => [n.id, n.position] as [string, { x: number; y: number }]),
  (list) => {
    // 这里就能安全地用 originalPositions.value 了
    list.forEach(([id, pos]) => {
      originalPositions.value[id] = { ...pos }
    })
  },
  { immediate: true }
)
/** —— 监听工作流切换 —— **/
watch(
  () => currentWorkflow.value?.objectId,
  async (id) => {
    if (!id) return
    // 先把 nodes/edges 重新注入
    edges.value = []
    nodes.value = []
    await nextTick()

    edges.value = currentWorkflow.value!.edges || []
    nodes.value = currentWorkflow.value!.nodes || []
    await nextTick()
    // 重新记录原始位置
    nodes.value.forEach((n) => {
      originalPositions.value[n.id] = { ...n.position }
    })
    await promiseTimeout(1000) // 等 VueFlow 渲染完
    // 如果此时已经处于 mini 模式，就跑布局；否则只 fitView
    if (mini.value) {
      applyLayout(true)
    } else {
      await nextTick()
      fitView({ padding: 0.1 })
    }
  },
  { immediate: true }
)




/** Dagre 布局函数 **/
function applyDagreLayout(
  rawNodes: typeof nodes.value,
  rawEdges: typeof edges.value,
  direction: 'LR' | 'TB' = 'LR'
) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 })

  const NODE_W = 375
  const NODE_H = 120

  rawNodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_W, height: NODE_H })
  })
  rawEdges.forEach((e) => {
    g.setEdge(e.source, e.target)
  })

  dagre.layout(g)

  return rawNodes.map((n) => {
    const { x, y } = g.node(n.id)!
    return {
      ...n,
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 }
    }
  })
}

/**
 * 统一的「应用布局」函数
 * @param toMini true = 用 Dagre 布局，false = 恢复原始位置
 */
async function applyLayout(toMini: boolean) {
  let newNodes = toMini
    ? applyDagreLayout(nodes.value, edges.value, 'LR')
    : nodes.value.map(n => ({
      ...n,
      position: originalPositions.value[n.id] || n.position
    }))

  if (toMini) {
    // —— 把所有 ChatInput/APIInput 节点的 x 坐标硬编码到 0 —— 
    newNodes = newNodes.map(n => {
      const t = n.data?.type
      if (t === 'ChatInput' || t === 'APIInput') {
        return {
          ...n,
          position: {
            x: 0,              // 或者你想要的左边距
            y: n.position.y
          }
        }
      }
      return n
    })
  }

  // 先刷新节点，再刷新边，保证所有连线会被重新渲染
  setNodes(newNodes)
  await promiseTimeout(1000) // 等待 VueFlow 渲染完
  setEdges([...edges.value])

  // 最后再 fitView
  await nextTick()
  fitView({ padding: 0.1 })
}
/** —— 监听迷你模式切换 —— **/
watch(
  () => mini.value,
  (isMini) => {
    applyLayout(isMini)
  }
)

// const currentNodes = ref<Node[]>([])
// const currentEdges = ref<Edge[]>([])

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



/* ----------------------------------------- */
/* 组合键监听                                 */
/* ----------------------------------------- */
const keys = useMagicKeys()
// 剪贴板：存最近一次 Ctrl+C 的 nodeId
const clipboardNodeId = ref<string | null>(null)

/* ----------------------------------------- */
/* 事件总线                                   */
/* ----------------------------------------- */
const { triggerCopyNode, triggerDuplicateNode } = useNodeEvents()

function isCopyPressed() {
  return keys['Ctrl+c']!.value || keys['Meta+c']!.value
}
function isPastePressed() {
  return keys['Ctrl+v']!.value || keys['Meta+v']!.value
}
/** 焦点是否落在用户可输入的区域 */
const isTextEditing = () => {
  const el = document.activeElement
  return (
    el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      (el as HTMLElement).isContentEditable)
  )
}

watch(isCopyPressed, (pressed) => {
  // 1. 必须按下复制快捷键
  // 2. 焦点不能在输入框 / contenteditable
  // 3. 当前确实选中了节点
  if (pressed && !isTextEditing() && selectedNodeId.value) {
    clipboardNodeId.value = selectedNodeId.value
    triggerCopyNode(selectedNodeId.value)
    useToast('已复制节点到剪贴板')
  }
})

watch(isPastePressed, (pressed) => {
  // 同理：焦点必须不在输入区域
  if (pressed && !isTextEditing() && clipboardNodeId.value) {
    triggerDuplicateNode(clipboardNodeId.value)
    useToast('已粘贴节点')
    clipboardNodeId.value = null // 清空剪贴板
  }
})

const colorMode = useColorMode()

</script>

<template>
  <div class="w-full h-full flex flex-col relative">
    <ClientOnly>

      <VueFlow @init="onFlowInit" style="width: 100%; height: 100%;" @pane-click="onPaneClick" :apply-default="false" :auto-pan-on-node-drag="true" @move="userAdjusted = true" @connect-start="onConnectStart" @connect-end="onConnectEnd" :nodes-draggable="true" :nodes-connectable="true" @node-click="handleNodeClick" @connect="handleConnect" @edges-change="handleEdgesChange" @nodes-change="handleNodesChange" v-model:nodes="nodes" v-model:edges="edges" :default-viewport="{ zoom: 0.5 }" :max-zoom="2" :min-zoom="0.1" :pan-on-drag="true" :zoom-on-scroll="true">
        <Background :gap="40" :size="3" :color="colorMode.value === 'dark' ? '#4a4a4a' : '#bcbcbc'" class="transition-colors duration-300" />
        <MiniMap :class="{ hidden: capturingScreenshotMode }" class="rounded-lg overflow-hidden shadow" :node-color="colorMode.value === 'dark' ? '#23272f' : '#e5e7eb'" :node-stroke-color="colorMode.value === 'dark' ? '#434b57' : '#9ca3af'" :mask-color="colorMode.value === 'dark' ? 'rgba(30,32,36,0.9)' : 'rgba(255,255,255,0.7)'" />
        <template #node-custom="props">


          <component :key="props.id" v-bind="props" :is="nodeComponentMap[props.data.component]" :id="props.id" :data="props.data" />

        </template>
        <template #edge-custom="props" v-if="!mini">
          <WorkflowEdge v-bind="props" :source="props.source" :target="props.target" :sourceHandle="props.data.sourceHandle" :targetHandle="props.data.targetHandle" :update-on-drag="true" />
        </template>
        <template #connection-line="props">
          <WorkflowConnection :source-x="(props as ConnectionLineProps).sourceX" :source-y="(props as ConnectionLineProps).sourceY" :target-x="(props as ConnectionLineProps).targetX" :target-y="(props as ConnectionLineProps).targetY" :color="connectionColor" />
        </template>
        <template #edge-custom="props" v-if="mini">
          <WorkflowMiniEdge v-bind="props" :source="props.source" :target="props.target" :sourceHandle="props.data.sourceHandle" :targetHandle="props.data.targetHandle" :update-on-drag="true" />
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
