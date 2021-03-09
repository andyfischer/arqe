
import TableMount, { TupleStreamCallback } from './TableMount';
import parseTuple from './parser/parseTuple';
import { unwrapTuple } from './tuple/UnwrapTupleCallback';
import parseCommand from './parseCommand';

interface DecoratedObject {
    handlers?: { commandStr: string, callback: any }[]
    name: string
    schemaStr: string
}

export function handles(commandStr: string) {
    return (object: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        const target = object as DecoratedObject;

        if (!target.handlers)
            target.handlers = [];

        const callback = target[propertyKey];
        // callback.name = propertyKey;

        target.handlers.push({commandStr, callback});
    }
}

export function decoratedObjToTableMount(obj: DecoratedObject) {
    if (!obj.handlers)
        throw new Error('expected object to have .handlers')

    if (!obj.schemaStr)
        throw new Error('expected object to have .schemaStr')

    const mount = new TableMount(obj.name, parseTuple(obj.schemaStr));

    for (const { commandStr, callback } of obj.handlers) {
        const boundCallback = callback.bind(obj);
        const tupleCallback = unwrapTuple(boundCallback);
        const command = parseCommand(commandStr);
        mount.addHandler(command.verb, command.tuple, tupleCallback);
    }
    
    return mount;
}
