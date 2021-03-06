
import parseTuple from './stringFormat/parseTuple'
import Tag from './Tag'
import Tuple, { isTuple, jsonToTuple } from './Tuple'

export function tup(value: any) {
    if (typeof value === 'string') {
        return parseTuple(value);
    }

    if (isTuple(value))
        return value;

    if (Array.isArray(value))
        return new Tuple(value);

    return jsonToTuple(value);
}

export function newTag(attr: string, value: any) {
    return new Tag({ attr, value });
}
