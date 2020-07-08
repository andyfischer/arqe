
import TuplePatternMatcher from './TuplePatternMatcher'
import NativeHandler from './NativeHandler'
import CommandPatternMatcher from './CommandPatternMatcher';

interface TargetObject {
    handlers?: CommandPatternMatcher<NativeHandler>
}

export function handles(commandStr: string) {
    return (object: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        const target = object as TargetObject;

        if (!target.handlers)
            target.handlers = new CommandPatternMatcher<NativeHandler>();

        const handler: NativeHandler = {
            name: propertyKey,
            func: target[propertyKey].bind(target)
        }

        target.handlers.addCommandStr(commandStr, handler);
    }
}
