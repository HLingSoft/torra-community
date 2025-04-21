import type { StructuredOutputData } from '@/types/node-data/structured-output'
import type {
  BuildContext,
  FlowNode,
  InputPortVariable,

} from '~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'

import { resolveInputVariables } from '../../langchain/resolveInput'

export async function structuredOutputFactory(node: FlowNode, context: BuildContext) {

  const { inputMessageVariable,languageModelVariable, structuredOutputVariable,dataFrameOutputVariable} = node.data as StructuredOutputData
 
  const variableDefs = [ inputMessageVariable,languageModelVariable] as InputPortVariable[]  
  

  const inputValues = await resolveInputVariables(context, variableDefs)
  const inputMessage = inputValues[inputMessageVariable.name]
  const languageModel = inputValues[languageModelVariable.name]


//   const preliminaryQuestionLLM = async (question: string, name: string, actor: string, history: IHistory[], channel: EnumChannel, character: Character): Promise<StandaloneJSONQuestionResult> => {
//     const condenseQuestionTemplate = `${preliminaryQuestionPrompt(channel, name, actor, character)}
  
//     Chat Histories:
//     {chat_history}
  
//     User Question: {question}
  
//   `
  
//     const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
//       condenseQuestionTemplate,
//     )
  
//     const llm = createStandaloneQuestionChat(character as any).bind({
//       functions: [preliminaryQuestionFunctions()],
//       function_call: { name: preliminaryQuestionFunctionName },
  
//     })
  
//     const standaloneQuestionChain = RunnableSequence.from([
//       {
//         question: (input: ConversationalRetrievalQAChainInput) => input.question,
//         chat_history: (input: ConversationalRetrievalQAChainInput) =>
//           formatChatHistory(input.chat_history),
//       },
//       CONDENSE_QUESTION_PROMPT,
//       llm,
//       new JsonOutputFunctionsParser(),
//     ])
//     // console.log('historyMessages', history)
//     const standaloneJSONQuestion = await standaloneQuestionChain.invoke({
//       question,
//       chat_history: history,
//     }) as StandaloneJSONQuestionResult
//     console.log('standaloneJSONQuestion', question, standaloneJSONQuestion)
//     return standaloneJSONQuestion
  return {
    [structuredOutputVariable.id]: runnablePrompt,
  }
}
