<script lang="ts" setup>
import type { TimezoneData } from '@/types/node-data/timezone'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { timezoneMeta } from '@/types/node-data/timezone'
import { useVueFlow } from '@vue-flow/core'
const props = defineProps<{
  id: string
}>()
// const { nodeExecutionTimes } = useNodeExecutionStats()
// const editMode = ref(false)

const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: TimezoneData }>()

const { addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()
const timezoneOptions = [
  { value: 'UTC', label: '标准时间（UTC）' },
  { value: 'Asia/Shanghai', label: '中国（上海）' },
  { value: 'Asia/Hong_Kong', label: '中国（香港）' },
  { value: 'Asia/Taipei', label: '中国（台湾）' },
  { value: 'Asia/Urumqi', label: '中国（新疆）' },
  { value: 'Africa/Cairo', label: '埃及（开罗）' },
  { value: 'Africa/Johannesburg', label: '南非（约翰内斯堡）' },
  { value: 'Africa/Nairobi', label: '肯尼亚（内罗毕）' },
  { value: 'America/Anchorage', label: '美国（安克雷奇）' },
  { value: 'America/Argentina/Buenos_Aires', label: '阿根廷（布宜诺斯艾利斯）' },
  { value: 'America/Bogota', label: '哥伦比亚（波哥大）' },
  { value: 'America/Chicago', label: '美国（芝加哥）' },
  { value: 'America/Denver', label: '美国（丹佛）' },
  { value: 'America/Halifax', label: '加拿大（哈利法克斯）' },
  { value: 'America/Los_Angeles', label: '美国（洛杉矶）' },
  { value: 'America/Mexico_City', label: '墨西哥（墨西哥城）' },
  { value: 'America/New_York', label: '美国（纽约）' },
  { value: 'America/Santiago', label: '智利（圣地亚哥）' },
  { value: 'America/Sao_Paulo', label: '巴西（圣保罗）' },
  { value: 'Asia/Almaty', label: '哈萨克斯坦（阿拉木图）' },
  { value: 'Asia/Amman', label: '约旦（安曼）' },
  { value: 'Asia/Baghdad', label: '伊拉克（巴格达）' },
  { value: 'Asia/Baku', label: '阿塞拜疆（巴库）' },
  { value: 'Asia/Bangkok', label: '泰国（曼谷）' },
  { value: 'Asia/Beirut', label: '黎巴嫩（贝鲁特）' },
  { value: 'Asia/Colombo', label: '斯里兰卡（科伦坡）' },
  { value: 'Asia/Dhaka', label: '孟加拉（达卡）' },
  { value: 'Asia/Dubai', label: '阿联酋（迪拜）' },
  { value: 'Asia/Ho_Chi_Minh', label: '越南（胡志明市）' },

  { value: 'Asia/Jakarta', label: '印尼（雅加达）' },
  { value: 'Asia/Jerusalem', label: '以色列（耶路撒冷）' },
  { value: 'Asia/Kathmandu', label: '尼泊尔（加德满都）' },
  { value: 'Asia/Kolkata', label: '印度（加尔各答）' },
  { value: 'Asia/Kuala_Lumpur', label: '马来西亚（吉隆坡）' },
  { value: 'Asia/Manila', label: '菲律宾（马尼拉）' },
  { value: 'Asia/Riyadh', label: '沙特（利雅得）' },
  { value: 'Asia/Seoul', label: '韩国（首尔）' },

  { value: 'Asia/Singapore', label: '新加坡' },
  { value: 'Asia/Tashkent', label: '乌兹别克斯坦（塔什干）' },
  { value: 'Asia/Tokyo', label: '日本（东京）' },
  { value: 'Asia/Ulaanbaatar', label: '蒙古国（乌兰巴托）' },
  { value: 'Asia/Yangon', label: '缅甸（仰光）' },
  { value: 'Australia/Adelaide', label: '澳大利亚（阿德莱德）' },
  { value: 'Australia/Brisbane', label: '澳大利亚（布里斯班）' },
  { value: 'Australia/Melbourne', label: '澳大利亚（墨尔本）' },
  { value: 'Australia/Perth', label: '澳大利亚（珀斯）' },
  { value: 'Australia/Sydney', label: '澳大利亚（悉尼）' },
  { value: 'Europe/Amsterdam', label: '荷兰（阿姆斯特丹）' },
  { value: 'Europe/Athens', label: '希腊（雅典）' },
  { value: 'Europe/Berlin', label: '德国（柏林）' },
  { value: 'Europe/Istanbul', label: '土耳其（伊斯坦布尔）' },
  { value: 'Europe/Lisbon', label: '葡萄牙（里斯本）' },
  { value: 'Europe/London', label: '英国（伦敦）' },
  { value: 'Europe/Madrid', label: '西班牙（马德里）' },
  { value: 'Europe/Moscow', label: '俄罗斯（莫斯科）' },
  { value: 'Europe/Paris', label: '法国（巴黎）' },
  { value: 'Pacific/Auckland', label: '新西兰（奥克兰）' },
  { value: 'Pacific/Honolulu', label: '美国（火奴鲁鲁）' },
]


onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.cloneDeep(timezoneMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as TimezoneData

  currentNode.value = node


  await nextTick()
  if (footer.value && !node.data.saved) {
    const outputPortId = nanoLowercaseAlphanumericId(10)
    node.data.outputVariable.id = outputPortId
    const offset = footer.value.offsetTop + footer.value.clientHeight / 2
    addOutputPort(props.id, outputPortId, 'pink', offset)
  }



})

onNodeClick((event) => {


})
</script>

<template>
  <!-- flex flex-col gap-6  border  pt-6 shadow-sm rounded-xl   text-card-foreground hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)] -->
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-card  focus:border focus: border-card">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />


    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
      <div class="w-full">
        <div class="flex flex-row items-center space-x-2 w-full">
          <p>Timezone</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-4">
          <Select v-model="currentNode.data.timezone" class="w-full">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a " />
            </SelectTrigger>
            <SelectContent class="w-full dark max-h-60">
              <SelectGroup>
                <SelectItem v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </SelectItem>

              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>

    <div ref="footer" class="bg-card rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center w-full">
      <div class="w-full h-full flex items-center justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />
        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />
        <div class="">
          Message
        </div>
      </div>
    </div>



  </Card>
</template>
