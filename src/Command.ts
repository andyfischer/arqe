
import RelationPattern from './RelationPattern'
import { parsedCommandToString } from './stringifyQuery'
import { PatternTag } from './RelationPattern'

type FlagMap = { [flag: string]: any }

export interface CommandFlags {
    x?: true
    list?: true
    get?: true
    count?: true
    exists?: true
}

export default class Command {
    command: string
    tags: PatternTag[]
    flags: CommandFlags
    payloadStr: string

    constructor(command: string, tags: PatternTag[], payload: string, flags: FlagMap) {
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
