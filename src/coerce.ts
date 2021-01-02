
import Tuple, { isTuple, nativeValueToTuple } from './Tuple'
import TupleTag, { newSimpleTag, isTag } from './TupleTag'
import Relation, { isRelation } from './Relation'
import Query, { isQuery, queryFromOneTuple, queryFromTupleArray, relationAsQuery } from './Query'
import { symValueType } from './internalSymbols'
import parseTuple from './stringFormat/parseTuple'
import { parseQuery } from './stringFormat/parseQuery'

export type TagLike = string | { [key: string]: any }
export type TupleLike = Tuple | string  | { [key:string]: any } | TagLike[]
export type QueryLike = Query | Tuple | string | TupleLike[]
export type RelationLike = Tuple | Relation | TupleLike | TupleLike[]

export function toTuple(val: TupleLike): Tuple {

    if (isTuple(val))
        return val as Tuple;

    if (isTag(val))
        return new Tuple([val as TupleTag]);

    if (typeof val === 'string')
        return parseTuple(val);

    if (Array.isArray(val)) {
        let tags = []

        for (const tagLike of val) {
            if (typeof tagLike === 'string') {
                tags.push(newSimpleTag(tagLike))
            } else if (isTuple(tagLike)) {
                tags = tags.concat(tagLike.tags);
            } else if (isTag(tagLike)) {
                tags.push(tagLike);
            } else {
                for (let k in tagLike) {
                    tags.push(newSimpleTag(k, tagLike[k]));
                }
            }
        }
        return new Tuple(tags);
    }

    return nativeValueToTuple(val);
}

export function toRelation(val: RelationLike): Relation {
    if (isRelation(val))
        return val as Relation;

    if (isTuple(val))
        return new Relation([val as Tuple]);

    if (Array.isArray(val)) {
        const tuples = [];
        for (const el of val) {
            tuples.push(toTuple(el));
        }
        return new Relation(tuples);
    }

    return new Relation([toTuple(val)]);
}

export function toQuery(value: QueryLike): Query {
    if (isQuery(value))
        return value as Query;

    if (isRelation(value))
        return relationAsQuery(value as Relation);

    if (typeof value === 'string')
        return parseQuery(value);

    if (isTuple(value))
        return queryFromOneTuple(value as Tuple);

    if (Array.isArray(value)) {
        return queryFromTupleArray(value.map(toTuple));
    }

    const asStr = value.stringify ? value.stringify() : value.toString();
    throw new Error(`can't convert type ${value[symValueType] || typeof value} to query: ` + asStr);
}
