<script lang="ts" setup>
import type { PropType } from 'vue'
import { GradientPath } from '@riadh-adrani/gradient-path'
import { BezierEdge, useVueFlow } from '@vue-flow/core'

const props = defineProps({
  id: String,
  source: String,
  target: String,
  segments: Number,
  updateOnDrag: Boolean,
  data: Object as PropType<{
    sourceColor: { type: string, required: false, default: 'white' }
    targetColor: { type: string, required: false, default: 'black' }
    sourceParent: string
    targetParent: string
  }>,
})

const { onNodeDrag, onSelectionDrag, onSelectionDragStop, onNodeDragStop } = useVueFlow()

const edge = ref(null)

const grEdge = ref<GradientPath>(null as unknown as GradientPath)

const getPath = (): SVGPathElement => {
  return (
    Array.from(document.querySelectorAll('.vue-flow__edge')).find(
      item => (item as SVGGElement).dataset.id === props.id!,
    ) as SVGGElement
  ).querySelector('path') as SVGPathElement
}

const segments = computed(() => props.segments!)
const updateOnDrag = computed(() => props.updateOnDrag)

watch(
  () => segments.value,
  (value) => {
    options.segments = value
    redraw()
  },
)

const options = reactive({
  segments: segments.value,
  samples: 1,
  precision: 2,
})

const pathOptions = {
  type: 'path',
  fill: [
    { color: props.data!.sourceColor, pos: 0 },
    { color: props.data!.targetColor, pos: 1 },
  ],
  width: 3,
}

const createGP = () => {
  return new GradientPath({
    path: getPath(),
    ...options,
  })
}

const renderGP = () => {
  return createGP().render(pathOptions)
}

const drawGP = () => {
  if (grEdge.value !== null) {
    grEdge.value.group.remove()
  }

  grEdge.value = renderGP()
}

const redraw = () => {
  grEdge.value.group.remove()
  grEdge.value = renderGP()
}

const update = () => {
  grEdge.value.update(pathOptions)
}

const remove = () => {
  grEdge.value.group.remove()
}

const shouldUpdate = (movingNode: string) => {
  return [props.data?.sourceParent, props.data?.targetParent].includes(movingNode)
}

const checkAndUpdate = (nodeId: string) => {
  if (shouldUpdate(nodeId)) {
    update()
    return true
  }
  else {
    return false
  }
}

onNodeDrag((event) => {
  if (!updateOnDrag.value) {
    return
  }

  checkAndUpdate(event.node.id)
})

onSelectionDrag((event) => {
  if (!updateOnDrag.value) {
    return
  }

  for (const node of event.nodes) {
    if (checkAndUpdate(node.id)) {
      return
    }
  }
})

onNodeDragStop((event) => {
  if (updateOnDrag.value) {
    return
  }

  checkAndUpdate(event.node.id)
})

onSelectionDragStop((event) => {
  if (updateOnDrag.value) {
    return
  }

  for (const node of event.nodes) {
    if (checkAndUpdate(node.id)) {
      return
    }
  }
})

onMounted(() => {
  drawGP()
})

onUnmounted(() => {
  remove()
})
</script>

<template>
  <!-- @vue-ignore -->
  <BezierEdge
    :id="id"
    ref="edge"
    :source="source"
    :target="target"
    :updatable="true"
    :class="id"
    :style="{ stroke: 'transparent' }"
  />
</template>
