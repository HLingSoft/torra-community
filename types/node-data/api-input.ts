import type { OutputPortVariable, KeyValueSchema } from '~/types/workflow'



export interface APIInputData {
    type: string
    title: string
    description: string
    icon?: string

    inputValue: KeyValueSchema
    structuredOutputVariable: OutputPortVariable
    // messageOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const APIInputLangchainName = 'APIInput'

export const apiInputMeta: APIInputData = {
    type: APIInputLangchainName,
    title: 'API Input',
    description: 'Workflow entry via API, parsing data and triggering AI processes.',
    icon: 'streamline-ultimate:coding-apps-website-web-dev-api-cloud',
    inputValue: {
    } as KeyValueSchema,
    structuredOutputVariable: {
        name: 'Structured Data',
        outputType: 'Structured Data',
    } as OutputPortVariable,

    show: true,
}
