import type { StructuredOutputData } from '@/types/node-data/structured-output'
import type {
  BuildContext,
  FlowNode,
  InputPortVariable,

} from '~/types/workflow'
import { RunnableLambda } from '@langchain/core/runnables'
import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import {
    RunnablePassthrough,
    RunnableSequence,
  } from '@langchain/core/runnables'
  import { ChatOpenAI  } from '@langchain/openai'
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function structuredOutputFactory(node: FlowNode, context: BuildContext) {

  const { inputMessageVariable,languageModelVariable,outputSchema, structuredOutputVariable,dataFrameOutputVariable} = node.data as StructuredOutputData
 
  const variableDefs = [ inputMessageVariable,languageModelVariable] as InputPortVariable[]  
  

  const inputValues = await resolveInputVariables(context, variableDefs)
  const inputMessage = inputValues[inputMessageVariable.name]
  const languageModel = inputValues[languageModelVariable.name] as ChatOpenAI

  const outputFunctionSchema ={
    name: outputSchema.name,
    // description: outputSchema.description,
    parameters: {
      type: 'object',
      properties: {
        ...outputSchema.value,
      },
      required: Object.keys(outputSchema.value),
    },
  }

  const llmWithFunction =languageModel.bind({
    functions: [outputFunctionSchema],
    function_call: { name: outputSchema.name   },
  })
   // 4. 构造 runnable chain（提示 + LLM + parser）
   const runnablePrompt = RunnableSequence.from([
    (input: string) => input, // 简单 passthrough 输入
    llmWithFunction,
    new JsonOutputFunctionsParser(), // 将返回 JSON 结构化
  ])

  const result=await runnablePrompt.invoke(inputMessage)
    //   const standaloneQuestionChain = RunnableSequence.from([
    //   {
    //     question: (input: ConversationalRetrievalQAChainInput) => input.question,
    //     chat_history: (input: ConversationalRetrievalQAChainInput) =>
    //       formatChatHistory(input.chat_history),
    //   },
    //   CONDENSE_QUESTION_PROMPT,
    //   llm,
    //   new JsonOutputFunctionsParser(),
    // ])


//   const preliminaryQuestionFunctionName = 'preliminaryQuestionFunctionName'
// const preliminaryQuestionFunctions = () => {
//   const extractionFunctionSchema = {
//     name: preliminaryQuestionFunctionName,
//     description: '根据上下文,  回答并判断是否需要检索第三方知识库文档和搜索网络。',
//     parameters: {
//       type: 'object',
//       properties: {
//         question: {
//           type: 'string',
//           description: '精细化后的问题',
//         },
//         answer: {
//           type: 'string',
//           description: '根据WorkFlow，回答用户的问题或者搜索提示语',
//         },
//         needQueryDocument: {
//           type: 'boolean',
//           description: '结合上下文和聊天记录，判断是不是要搜索第三方知识库文档才能回答用户的问题',
//         },
//         needSearchWebsite: {
//           type: 'boolean',
//           description: '结合上下文和聊天记录，判断是不是要搜索互联网才能回答用户的问题',
//         },

//       },
//       required: ['question', 'answer', 'needQueryDocument', 'needSearchWebsite'],
//     },
//   }
//   return extractionFunctionSchema
// }
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
    [structuredOutputVariable.id]: RunnableLambda.from(async () => {
        return result
      }),
  }
}
