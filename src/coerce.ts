
import Tuple, { isTuple } from './Tuple'
import Relation, { isRelation } from './Relation'
import Query, { isQuery, queryFromOneTuple } from './Query'
import { symValueType } from './internalSymbols'
import parseTuple from './stringFormat/parseTuple'
import { parseQuery } from './stringFormat/parseQuery'
import objectToTuple from './objectToTuple'

export type TupleLike = Tuple | string  | { [key:string]: any }
export type QueryLike = Query | Tuple | string
export type RelationLike = Tuple | Relation | TupleLike[] | TupleLike

export function toTuple(val: TupleLike): Tuple {
    if (val && val[symValueType] === 'tuple')
        return val as Tuple;

    if (typeof val === 'string')
        return parseTuple(val);

    return objectToTuple(val);
}

export function toRelation(val: RelationLike): Relation {
    if (isRelation(val))
        return val as Relation;

    if (isTuple(val))
        return new Relation([val as Tuple]);

    if (Array.isArray(val))
        return new Relation(val.map(toTuple));

    return new Relation([toTuple(val)]);
}

export function toQuery(value: QueryLike): Query {
    if (isQuery(value))
        return value as Query;

    if (typeof value === 'string')
        return parseQuery(value);

    if (isTuple(value))
        return queryFromOneTuple(value as Tuple);

    throw new Error(`can't convert type ${value[symValueType] || typeof value} to program: ` + value);
}
