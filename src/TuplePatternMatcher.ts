
import Tuple from './Tuple'

export default class TuplePatternMatcher<V> {

    cases: { pattern: Tuple, value: V}[] = []

    add(pattern: Tuple, value: V) {
        this.cases.push({pattern, value});
    }

    find(tuple: Tuple): V | null {
        for (const { pattern, value } of this.cases) {

            // console.log(`(${pattern}).isSupersetOf(${tuple}) = ${pattern.isSupersetOf(tuple)}`)

            if (pattern.isSupersetOf(tuple))
                return value;
        }

        return null;
    }
}

