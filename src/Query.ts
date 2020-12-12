
import Tuple, { tupleToJson, jsonToTuple } from './Tuple'
import IDSource from './utils/IDSource'
import { CommandFlags } from './Command'
import Stream from './Stream'
import QueryContext from './QueryContext'
import Pipe from './Pipe'
import runOneCommand, { builtinVerbs } from './runOneCommand'
import { emitCommandError } from './CommandUtils'
import { symValueType } from './internalSymbols'
import { TupleLike, toTuple } from './coerce'
import Relation, { relationToJsonable } from './Relation'
import { RelationLike, toRelation } from './coerce'
import { isRelation } from './Relation'

type QueryTermId = string;

type Query = Relation;

export default Query;

export function queryFromOneTuple(tuple: Tuple) {
    return relationAsQuery(new Relation([ tuple ]));
}

export function queryFromTupleArray(tuples: Tuple[]) {
    return relationAsQuery(new Relation(tuples));
}

export function runQuery(cxt: QueryContext, query: Query, overallOutput: Stream) {

    const inputPipes = new Map<QueryTermId, Pipe>();
    const outputPipes = new Map<QueryTermId, Pipe>();

    interface RunnableStep {
        termId: string
        input: Pipe
        output: Pipe
        verb: string
        tuple: Tuple
        searchPattern: Tuple,
        flags: any
    }

    const runnableSteps: RunnableStep[] = [];

    // Initialize runnable steps
    for (const term of query.body()) {
        const termId = term.get('query-term-id');
        runnableSteps.push({
            termId,
            input: new Pipe(),
            output: new Pipe(),
            flags: term.getOptional('flags', null),
            verb: term.get('verb'),
            searchPattern: termToSearchPattern(term),
            tuple: termToSearchPattern(term)
        });
    }

    // Hook up input pipes
    for (let stepIndex = 0; stepIndex < runnableSteps.length; stepIndex++) {

        const step = runnableSteps[stepIndex];
        const previousStep = runnableSteps[stepIndex - 1];

        if (previousStep) {
            previousStep.output.sendTo(step.input);
        } else {
            step.input.done();
        }
    }

    // Handle the last output.
    if (runnableSteps.length > 0) {
        runnableSteps[runnableSteps.length-1].output.sendTo({
            next(t:Tuple) {
                overallOutput.next(t);
            },
            done() {
                overallOutput.done();
                cxt.graph && cxt.graph.flushPendingChangeEvents();
            }
        });
    }

    // Run
    for (const step of runnableSteps) {
        runOneCommand(cxt, step);
    }
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

export function relationAsQuery(rel: Relation): Relation {
    if (rel.getFact('isQuery'))
        return rel;

    const ids = new IDSource();

    const result = rel.remap((term:Tuple) => {
        if (!term.has('verb')) {
            const verb = term.tags[0].attr;
            term = term.removeTagAtIndex(0).setValue('verb', verb);
        }

        if (!term.has('query-term-id'))
            term = term.setValue('query-term-id', ids.take());

        return term;
    });

    result.setFact('isQuery', true);

    return result;
}
