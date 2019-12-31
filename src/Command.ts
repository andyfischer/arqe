
import { commandArgsToString } from './parseCommand'

export interface CommandTag {
    // Syntax fields
    tagType?: string
    tagValue?: string
    negate?: boolean
    star?: boolean
    starValue?: boolean
    questionValue?: boolean

    // Semantic fields
    tagTypeInherits?: boolean
}

export default interface Command {
    command: string
    flags: { [flag: string]: any }
    tags: CommandTag[]
    payloadStr: string

    // Execution context
    respond?: (msg: string) => void
}

export function newCommand(): Command {
    return {
        flags: {},
        command: '',
        payloadStr: '',
        tags: []
    }
}
