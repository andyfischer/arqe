
import Tuple from './Tuple'

export default class TuplePatternMatcher<V> {

    cases: { pattern: Tuple, value: V }[] = []

    add(pattern: Tuple, value: V) {
        this.cases.push({pattern, value});
    }

    find(tuple: Tuple): V | null {
        for (const { pattern, value } of this.cases) {

            if (pattern.isSupersetOf(tuple))
                return value;
        }

        return null;
    }

    *findMulti(tuple: Tuple) {
        for (const { pattern, value } of this.cases) {
            if (pattern.isSupersetOf(tuple))
                yield value;
        }
    }

    stringify() {
        return `[ ${this.cases.map(c => c.pattern.stringify() + ' => ' + c.value).join(', ')} ]`;
    }
}

