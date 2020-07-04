
import { parsePattern } from './parseCommand'
import TuplePatternMatcher from './TuplePatternMatcher'

export function handles(patternStr: string) {
    const pattern = parsePattern(patternStr);

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (!target.handlers)
            target.handlers = new TuplePatternMatcher();

        target.handlers.add(pattern, target[propertyKey]);
    }
}
