<script lang="ts" setup>
import type { PropType } from 'vue'

import { Position, useVueFlow } from '@vue-flow/core'
import { onMounted, ref } from 'vue'

interface Port {
  name: string
  color: string
  dataType: string
}
const props = defineProps({
  id: { type: String, required: true },
  position: { type: Object as PropType<{ x: number, y: number }>, required: true },
  data: {
    type: Object as PropType<{
      name: string
      subName: string
      inputs: Array<Port>
      output?: Port
    }>,
    required: true,
  },
})
const createPortId = (parent: string, name: string, type: 'input' | 'output'): string => {
  return `${parent}-${type}-${name}`
}
const { addNodes } = useVueFlow()

const el = ref(null)

onMounted(() => {
  // const U_WIDTH = 150
  const U_HEADER_HEIGHT = 65

  // const C_WIDTH = U_WIDTH / 2
  const C_HEIGHT = 25
  const C_MARGIN = 5

  const calculatePortY = (i: number): number => {
    return U_HEADER_HEIGHT + (C_HEIGHT + C_MARGIN) * i
  }

  // const calculateHeight = (height: number): number => {
  //   return height * (C_HEIGHT + C_MARGIN)
  // }

  const id = props.id

  if (!props.data) {
    return
  }

  const ins = props.data.inputs ? props.data.inputs.length : 0
  const outs = props.data.output ? 1 : 0

  const length = Math.max(ins, outs)

  // const hel = (el.value as unknown as HTMLElement).querySelector(
  //   '.u-node-connectors',
  // ) as HTMLElement

  // hel.style.height = `${calculateHeight(length)}px`
  console.log('props.data.inputs', props.data.inputs)
  if (props.data.inputs) {
    props.data.inputs.forEach((item, index) => {
      const nodePos = { x: 0, y: calculatePortY(index) }

      addNodes([
        {
          id: createPortId(id, item.name, 'input'),
          position: nodePos,
          // label: item.name,
          parentNode: id,
          draggable: false,
          type: 'input',
          class: 'u-node-connector-input',
          sourcePosition: Position.Left,
          style: { '--vf-node-color': item.color },
          data: { color: item.color },
        },
      ])
    })
  }

  if (props.data.output) {
    const out = props.data.output

    addNodes([
      {
        id: createPortId(id, out.name, 'output'),
        position: {
          x: 75,
          y: calculatePortY(length % 2 !== 0 ? Math.trunc(length / 2) : length / 2),
        },
        label: out.name,
        parentNode: id,
        draggable: false,
        type: 'output',
        class: 'u-node-connector-output',
        targetPosition: Position.Right,
        data: { color: out.color },
        style: {
          '--vf-node-color': out.color,
        },
      },
    ])
  }
})
</script>

<template>
  <div ref="el" class="u-node ">
    <Card>
      <CardHeader>
        <CardTitle class="text-white">
          Card Title
        </CardTitle>
        <CardDescription class="text-white">
          Card Description
        </CardDescription>
      </CardHeader>
      <CardContent class="text-white">
        Card Content
      </CardContent>
      <CardFooter class="text-white">
        Card Footer
      </CardFooter>
    </Card>
    <!-- <div class="u-node-heading">
      <span class="u-node-heading-title">{{ data.name }}</span>
      <span class="u-node-heading-sub-title">{{ data.subName }}</span>
    </div> -->
    <!-- <div class="u-node-connectors"></div> -->
  </div>
</template>

<style lang="scss">
$U_WIDTH: 150px;
$U_HEADER_HEIGHT: 65px;

$C_WIDTH: 75px;
$C_HEIGHT: 25px;
$C_OFFSET: -20px;

.u-node {
  background-color: #2b2a2a;
  border-radius: 4px;
  width: $U_WIDTH;
  padding: 5px 0px;
  color:white;

  &-connector {
    &-input,
    &-output {
      height: $C_HEIGHT;
      padding: 0px;
      display: flex;
      font-size: 0.7em !important;
      align-items: center;
      justify-content: center;
      width: $C_WIDTH !important;
      background-color: transparent !important;

      border-color: transparent !important;

      & > .vue-flow__handle {
        width: 10px;
        height: 10px;
        outline: 2px solid var(--vf-node-color);
        outline-offset: 4px;
        border: none;
      }
    }

    /* &-input {
      justify-content: flex-start;
      & > .vue-flow__handle {
        left: $C_OFFSET;
      }
    }

    &-output {
      justify-content: flex-end;
      & > .vue-flow__handle {
        right: $C_OFFSET;
      }
    } */
  }
}
</style>
