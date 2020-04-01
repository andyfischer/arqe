
import Pattern from './Pattern'
import { parsedCommandToString } from './stringifyQuery'
import PatternTag from './PatternTag'

type FlagMap = { [flag: string]: any }

export interface CommandFlags {
    x?: true
    list?: true
    get?: true
    count?: true
    exists?: true
}

export default class Command {
    commandName: string
    tags: PatternTag[]
    flags: CommandFlags
    payloadStr: string

    constructor(commandName: string, tags: PatternTag[], payload: string, flags: FlagMap) {
        this.commandName = commandName;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }

    toPattern() {
        return new Pattern(this.tags);
    }

    toRelation() {
        const rel = new Pattern(this.tags);
        rel.setPayload(this.payloadStr);
        return rel;
    }

    stringify() {
        return parsedCommandToString(this);
    }
}
