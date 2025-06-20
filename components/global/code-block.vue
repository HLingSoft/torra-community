<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
// import { codeToHtml } from 'shiki'

const props = defineProps<{
    code: string
    lang: string
}>()


const { copy } = useClipboard()
const highlightedMarkdown = computed(() => {
    return `\`\`\`${props.lang}\n${props.code}\n\`\`\``
})


function copyCode() {
    copy(props.code)
    useToast('Code copied to clipboard')
}
</script>

<template>
    <div class="overflow-hidden">
        <div class="flex flex-row items-center  justify-between">
            <div class="flex items-center space-x-2 ">
                <NuxtIcon name="heroicons:command-line" size="20" />
                <p>cURL</p>
                <NuxtIcon name="clarity:info-line" size="20" />
            </div>

            <Button size="sm" variant="ghost" @click="copyCode">
                <NuxtIcon name="lucide:copy" class="w-4 h-4 mr-1" />
                <span class="text-xs">Copy</span>
            </Button>

        </div>


        <ScrollArea class="h-full">

            <MDC :value="highlightedMarkdown" class="text-sm" />
        </ScrollArea>


    </div>
</template>

<style scoped>
 ::v-deep(pre.shiki) {
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: #1e1e1e;
  min-height: 100%;
  height: 100%;
  overflow: auto;
}
</style>
