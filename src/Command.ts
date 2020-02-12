
import RelationPattern from './RelationPattern'
import { parsedCommandToString } from './stringifyQuery'

export interface CommandTag {
    // Syntax fields
    tagType?: string
    tagValue?: string
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
}

type FlagMap = { [flag: string]: any }

export interface CommandFlags {
    x?: true
    list?: true
    get?: true
}

export default class Command {
    command: string
    tags: CommandTag[]
    flags: CommandFlags
    payloadStr: string

    constructor(command: string, tags: CommandTag[], payload: string, flags: FlagMap) {
        this.command = command;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }

    toPattern() {
        return new RelationPattern(this.tags);
    }

    stringify() {
        return parsedCommandToString(this);
    }
}
