
import TuplePatternMatcher from './TuplePatternMatcher'
import NativeHandler from './NativeHandler'
import CommandPatternMatcher from './CommandPatternMatcher';
import TableMount from './TableMount';
import parseTuple from './parseTuple';

interface DecoratedObject {
    handlers?: { commandStr: string, handler: NativeHandler }[]
    name: string
    schemaStr: string
}

export function handles(commandStr: string) {
    return (object: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        const target = object as DecoratedObject;

        if (!target.handlers)
            target.handlers = [];

        const handler: NativeHandler = {
            name: propertyKey,
            func: target[propertyKey],
            protocol: 'js_object'
        }

        target.handlers.push({ commandStr, handler });
    }
}

export function decoratedObjToTableMount(obj: DecoratedObject) {
    if (!obj.handlers)
        throw new Error('expected object to have .handlers')

    if (!obj.schemaStr)
        throw new Error('expected object to have .schemaStr')

    const mount = new TableMount(obj.name, parseTuple(obj.schemaStr));

    for (const { commandStr, handler } of obj.handlers) {
        const func = handler.func.bind(obj);
        mount.addHandler(commandStr, {
            ...handler,
            func,
        })
    }
    
    return mount;
}