<script lang="ts" setup>


import type { BigFileUploadData } from '~~/types/node-data/big-file-upload'
import { bigFileUploadMeta } from '~~/types/node-data/big-file-upload'
const fileInputKey = ref(0)
const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: BigFileUploadData } | null>(null)

const selectedFile = ref<File | null>(null)
const fileError = ref<string | null>(null)

const fileInputRef = ref<HTMLInputElement | null>()
async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return


    const maxSizeMB = 200 // 设置最大文件大小为 2MB
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
        fileError.value = `文件大小不能超过 ${maxSizeMB}MB`
        fileInputRef.value = null
        selectedFile.value = null
        fileInputKey.value++
        return
    }
    selectedFile.value = file
    fileError.value = null
    const avFile = new LC.File(file.name, file)
    await avFile.save()
    const fileUrl = avFile.url()
    console.log(avFile.url())
    Object.assign(currentNode.value!.data, {
        fileRemoteUrl: fileUrl,
        selectedFileName: file.name,
        selectedFileType: file.type,
        selectedFileSize: file.size,
    })



}

function clearFile() {
    selectedFile.value = null
    fileError.value = null
    currentNode.value!.data.fileRemoteUrl = '' // 清空 base64 数据
    fileInputRef.value = null
    fileInputKey.value++ // 👉 强制刷新 input
}

onMounted(() => {
    const d = currentNode.value?.data
    if (!d) return
    // 等 node 数据准备好
    watchEffect(async () => {
        const d = currentNode.value?.data
        if (!d) return

        // 已有 Base64 但页面 state 里还没有 File → 还原
        if (d.fileRemoteUrl && !selectedFile.value) {
            // const dataUrl = `data:${d.selectedFileType};base64,${d.selectedFileBase64Data}`

            // fetch+blob 把 base64 转回来
            const blob = await fetch(d.fileRemoteUrl).then(r => r.blob())
            selectedFile.value = new File([blob], d.selectedFileName || 'file', {
                type: d.selectedFileType,
                lastModified: Date.now(),
            })
        }
    })
})
const { copy } = useClipboard()
const copyFileUrl = () => {
    if (!currentNode.value?.data.fileRemoteUrl) {
        return
    }
    copy(currentNode.value.data.fileRemoteUrl)
    useToast('已复制文件链接到剪贴板')
}

const { mini } = useMiniNode()

</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="bigFileUploadMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <div v-show="!mini" class="space-y-4">
                    <div>
                        <Label for="file">上传文件(最大 200M)</Label>
                        <Input id="file" :key="fileInputKey" type="file" ref="fileInputRef" accept="*/*" class="mt-4" @change="handleFileChange" />
                    </div>

                    <div v-if="selectedFile" class="text-sm text-muted-foreground flex flex-col space-y-2">
                        <div>✅ 已选择文件：</div>
                        <div>{{ selectedFile.name }}（{{ (selectedFile.size / 1024).toFixed(1) }} KB）</div>
                        <div v-if="currentNode.data.fileRemoteUrl && currentNode.data.fileRemoteUrl.length > 0" class="animate-fadeIn flex flex-row items-center space-x-2 justify-between">
                            <div class="line-clamp-1">{{ currentNode.data.fileRemoteUrl }}</div>
                            <Button variant="outline" size="sm" @click="copyFileUrl" class="text-xs">Copy</Button>
                        </div>
                        <Button class="mt-5 " variant="outline" @click="clearFile">
                            <NuxtIcon name="fluent:delete-12-regular" size="20" class="mr-2 " />
                            清除文件
                        </Button>


                    </div>

                    <div v-if="fileError" class="text-sm text-red-500">
                        {{ fileError }}
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputPortVariable" />
            </template>
        </WorkflowBaseNode>
    </div>
</template>
