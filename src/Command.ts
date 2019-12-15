
import { commandArgsToString } from './parseCommand'

export interface CommandTag {
    // Syntax fields
    tagType?: string
    tagValue?: string
    subtract?: boolean
    star?: boolean
    starValue?: boolean
    questionValue?: boolean

    // Semantic fields
    tagTypeInherits?: boolean
}

export default interface Command {
    command: string
    tags: CommandTag[]
    payloadStr: string

    // Execution context
    respond?: (msg: string) => void
    respondPart?: (msg: string) => void
    respondEnd?: () => void
}

export function newCommand(): Command {
    return {
        command: '',
        payloadStr: '',
        tags: []
    }
}
