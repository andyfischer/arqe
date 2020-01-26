
import { commandArgsToString } from './parseCommand'

export interface CommandTag {
    // Syntax fields
    tagType?: string
    tagValue?: string
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean

    // Semantic fields
    tagTypeInherits?: boolean
}

type FlagMap = { [flag: string]: any }

export default class Command {
    command: string
    tags: CommandTag[]
    payloadStr: string
    flags: FlagMap

    constructor(command: string, tags: CommandTag[], payload: string, flags: FlagMap) {
        this.command = command;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }
}

