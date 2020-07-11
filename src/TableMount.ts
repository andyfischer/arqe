
import Tuple from './Tuple'
import TableStorage from './TableStorage'
import CommandPatternMatcher from './CommandPatternMatcher'
import NativeHandler from './NativeHandler'
import parseTuple from './parseTuple'

interface DecoratedObject {
    handlers: CommandPatternMatcher<NativeHandler>
    name: string
    schemaStr: string
}

export default class TableMount {
    name: string
    schema: Tuple
    storage: TableStorage

    handlers = new CommandPatternMatcher<NativeHandler>()

    constructor(name: string, schema: Tuple, storage: TableStorage) {
        this.name = name;
        this.schema = schema;
        this.storage = storage;
    }
}

export function decoratedObjToTableMount(obj: DecoratedObject) {
    if (!obj.handlers)
        throw new Error('expected object to have .handlers')

    const mount = new TableMount(obj.name, parseTuple(obj.schemaStr), null);
    mount.handlers = obj.handlers;
    return mount;
}