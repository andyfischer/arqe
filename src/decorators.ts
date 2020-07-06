
import { parsePattern } from './parseCommand'
import TuplePatternMatcher from './TuplePatternMatcher'
import NativeHandler from './NativeHandler'

interface TargetObject {
    handlers?: TuplePatternMatcher<NativeHandler>
}

export function handles(patternStr: string) {
    const pattern = parsePattern(patternStr);

    return (object: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        const target = object as TargetObject;

        if (!target.handlers)
            target.handlers = new TuplePatternMatcher<NativeHandler>();

        const handler: NativeHandler = {
            name: propertyKey,
            func: target[propertyKey].bind(target)
        }

        target.handlers.add(pattern, handler);
    }
}
