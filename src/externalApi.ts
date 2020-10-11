
import parseTuple from './stringFormat/parseTuple'
import TupleTag from './TupleTag'
import Tuple, { isTuple } from './Tuple'
import objectToTuple from './objectToTuple'

export function tup(value: any) {
    if (typeof value === 'string') {
        return parseTuple(value);
    }

    if (isTuple(value))
        return value;

    if (Array.isArray(value))
        return new Tuple(value);

    return objectToTuple(value);
}

export function newTag(attr: string, value: any) {
    return new TupleTag({ attr, value });
}
