
import { jsonToTuple, tupleToJson } from './Tuple'
import Tuple from './Tuple'

type FlagMap = { [flag: string]: any }

export interface CommandFlags {
    x?: true
    list?: true
    get?: true
    count?: true
    exists?: true
}

export default class Command {
    verb: string
    flags: CommandFlags
    tuple: Tuple

    constructor(verb: string, tuple: Tuple, flags: FlagMap) {
        this.verb = verb;
        this.tuple = tuple;
        this.flags = flags;
    }

    stringify() {
        let str = this.verb;

        for (const flag in this.flags) {
            str += ' -' + flag;
        }
        
        str += ' ' + this.tuple.stringify()

        return str;
    }
}

export function commandToJson(command: Command) {
    return {
        verb: command.verb,
        flags: command.flags,
        ...tupleToJson(command.tuple)
    }
}

export function jsonToCommand(obj: any): Command {
    const tupleObj = { ...obj };
    delete tupleObj.verb;
    delete tupleObj.flags;
    const tuple = jsonToTuple(tupleObj);

    return new Command(obj.verb, tuple, obj.flags);
}
