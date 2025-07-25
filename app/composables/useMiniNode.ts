// composables/useMiniNode.ts
import { onMounted, watch } from 'vue'

export const useMiniNode = () => {
    const mini = useState<boolean>('mini-node-mode', () => false)

    onMounted(() => {
        watch(
            mini,
            (val) => {
                document.body.classList.toggle('mini-node-mode', val)
            },
            { immediate: true }
        )
    })

    const toggle = () => {
        mini.value = !mini.value
    }

    return { mini, toggle }
}
