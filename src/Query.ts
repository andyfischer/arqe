
import Tuple, { tupleToJson, jsonToTuple } from './Tuple'
import IDSource from './utils/IDSource'
import { CommandFlags } from './Command'
import Stream from './Stream'
import QueryContext from './QueryContext'
import Pipe from './Pipe'
import { emitCommandError } from './CommandUtils'
import { symValueType } from './internalSymbols'
import { TupleLike, toTuple } from './coerce'
import Relation, { relationToJsonable } from './Relation'
import { RelationLike, toRelation } from './coerce'
import { isRelation } from './Relation'
import { builtinVerbs } from './everyVerb'

type Query = Relation;

export default Query;

export function queryFromOneTuple(tuple: Tuple) {
    return relationAsQuery(new Relation([ tuple ]));
}

export function queryFromTupleArray(tuples: Tuple[]) {
    return relationAsQuery(new Relation(tuples));
}

export function termToSearchPattern(term: Tuple) {
    return term.removeAttr('query-term-id').removeAttr('verb').removeAttr('flags');
}

export function isQuery(val: any) {
    return isRelation(val) && val.getFact('isQuery');
}

export function queryToJson(query: Query) {
    const tuplesOut = []

    for (const tuple of query.tuples) {
        tuplesOut.push(tupleToJson(tuple));
    }

    return {
        query: tuplesOut
    }
    return { query: relationToJsonable(query) }
}

export function jsonToQuery(data: any) {
    if (!data.query)
        throw new Error("expected data to have .query: " + data)

    const tuples = data.query.map(jsonToTuple);
    return relationAsQuery(new Relation(tuples));
}

function extractVerbForTerm(term: Tuple) {
    if (term.hasAttr('verb'))
        return term;

    if (term.hasAttr('get')) {
        term = term.removeAttr('get');
        term = term.setValue('verb', 'get')
        return term;
    }

    const firstAttr = term.tags[0].attr;

    if (builtinVerbs[firstAttr]) {
        return term.removeTagAtIndex(0).setValue('verb', firstAttr);
    }

    return term.setValue('verb', 'get');
}

export function relationAsQuery(rel: Relation): Relation {
    if (rel.getFact('isQuery'))
        return rel;

    const ids = new IDSource();

    const result = rel.remapTuples((term:Tuple) => {

        let originalTerm = term;
        term = extractVerbForTerm(term);

        // console.log('extractVerbForTerm: ', originalTerm.stringify(), term.stringify())

        if (!term.has('query-term-id'))
            term = term.setValue('query-term-id', ids.take());

        return term;
    });

    result.setFact('isQuery', true);

    return result;
}
