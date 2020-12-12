
import TupleTag from './TupleTag'
import { isTuple } from './Tuple'

export function isUniqueTag(t: TupleTag) {
    return (isTuple(t.value)
        && t.value.tags[0]
        && t.value.tags[0].attr === 'unique');
}

export function isEnvTag(t: TupleTag) {
    return (isTuple(t.value)
        && t.value.tags[0]
        && t.value.tags[0].attr === 'env');
}

export function isSubqueryTag(t: TupleTag) {
    return (isTuple(t.value)
        && t.value.tags[0]
        && t.value.tags[0].attr === 'subquery');
}
