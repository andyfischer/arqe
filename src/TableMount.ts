
import Tuple from './Tuple'
import CommandPatternMatcher from './CommandPatternMatcher'
import NativeHandler from './NativeHandler'
import parseTuple from './parseTuple'
import { callNativeHandler } from "./NativeHandler";
import { emitCommandError } from './CommandMeta'
import Stream from './Stream'

interface DecoratedObject {
    handlers?: CommandPatternMatcher<NativeHandler>
    name: string
    schemaStr: string
}

export default class TableMount {
    name: string
    schema: Tuple
    handlers = new CommandPatternMatcher<NativeHandler>()

    constructor(name: string, schema: Tuple) {
        this.name = name;
        this.schema = schema;
    }

    addHandler(commandStr: string, handler: NativeHandler) {
        this.handlers.addCommandStr(commandStr, handler);
    }

    hasHandler(commandName: string, tuple: Tuple) {
        return !!this.handlers.find(commandName, tuple);
    }

    call(commandName: string, tuple: Tuple, out: Stream): boolean {
        const handler = this.handlers.find(commandName, tuple);
        if (!handler) {
            return false;
        }

        callNativeHandler(handler, tuple, out);
        return true;
    }

    callOrError(commandName: string, tuple: Tuple, out: Stream) {
        if (!this.call(commandName, tuple, out)) {
            emitCommandError(out, `Table ${this.name} doesn't support: ${commandName} ${tuple.stringify()}`)
            out.done();
            return;
        }
    }
}

export function decoratedObjToTableMount(obj: DecoratedObject) {
    if (!obj.handlers)
        throw new Error('expected object to have .handlers')

    if (!obj.schemaStr)
        throw new Error('expected object to have .schemaStr')

    const mount = new TableMount(obj.name, parseTuple(obj.schemaStr));
    mount.handlers = obj.handlers;
    return mount;
}
