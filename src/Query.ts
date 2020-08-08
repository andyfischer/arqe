
import Pattern from './Pattern'

type FlagMap = { [flag: string]: any }

export interface QueryFlags {
    x?: true
    list?: true
    get?: true
    count?: true
    exists?: true
}

export default class Query {
    commandName: string
    flags: QueryFlags
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
        let str = this.commandName;

        for (const flag in this.flags) {
            str += ' -' + flag;
        }
        
        str += ' ' + this.pattern.stringify()

        return str;
    }
}
