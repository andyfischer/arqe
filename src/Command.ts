
import Pattern from './Pattern'
import { parsedCommandToString } from './stringifyQuery'

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
    flags: CommandFlags
    pattern: Pattern

    constructor(commandName: string, pattern: Pattern, flags: FlagMap) {
        this.commandName = commandName;
        this.pattern = pattern;
        this.flags = flags;
    }

    toPattern() {
        return this.pattern;
    }

    toRelation() {
        return this.pattern;
    }

    stringify() {
        return parsedCommandToString(this);
    }
}
