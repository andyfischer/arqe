
import { commandArgsToString } from './parseCommand'

export interface CommandTag {
    // Syntax fields
    tagType?: string
    tagValue?: string
    subtract?: boolean
    starType?: boolean
    starValue?: boolean

    // Semantic fields
    tagTypeInherits?: boolean
}

export default class Command {
    command: string
    tags: CommandTag[] = []
    payloadStr: string

    toCommandString() {
        return this.command + ' ' + commandArgsToString(this.tags);
    }
}