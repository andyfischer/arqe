
import Tuple, { tupleToJson, jsonToTuple } from './Tuple'
import IDSource from './utils/IDSource'
import { CommandFlags } from './Command'
import Stream from './Stream'
import QueryContext from './QueryContext'
import Pipe from './Pipe'
import { emitCommandError } from './CommandUtils'
import { symValueType } from './internalSymbols'
import { TupleLike, toTuple } from './coerce'
import Relation, { relationToJson } from './Relation'
import { RelationLike, toRelation } from './coerce'
import { isRelation } from './Relation'
import { builtinVerbs } from './everyVerb'

type Query = Relation;

export default Query;

export function isQuery(val: any) {
    // todo, could do more type checking here
    return isRelation(val);
}

export function queryToJson(query: Query) {
    const tuplesOut = []

    for (const tuple of query.tuples) {
        tuplesOut.push(tupleToJson(tuple));
    }

    return {
        query: tuplesOut
    }
}

export function jsonToQuery(data: any) {
    if (!data.query)
        throw new Error("expected data to have .query: " + data)

    if (!Array.isArray(data.query))
        throw new Error("expected .query to be an array: " + data)


    const tuples = data.query.map(jsonToTuple);
    return new Relation(tuples) as Query;
}
