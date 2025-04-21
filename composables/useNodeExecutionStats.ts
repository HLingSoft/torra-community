const nodeExecutionTimes = ref<Record<string, string>>({})

export function useNodeExecutionStats() {
  const setExecutionTime = (nodeId: string, elapsed: string) => {
    nodeExecutionTimes.value[nodeId] = elapsed
  }

  return {
    nodeExecutionTimes,
    setExecutionTime,
  }
}
