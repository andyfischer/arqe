
import Tuple from './Tuple'
import IDSource from './utils/IDSource'
import { CommandFlags } from './Command'
import Stream from './Stream'
import QueryContext from './QueryContext'
import Pipe from './utils/Pipe'
import runOneCommand, { builtinVerbs } from './runOneCommand'
import { emitCommandError } from './CommandUtils'
import { symValueType } from './internalSymbols'
import { TupleLike, toTuple } from './coerce'

export type TermId = string

interface Term {
    id: TermId
    verb: string
    flags: CommandFlags
    tuple: Tuple
    stdinFrom?: TermId
}

interface RunPhase {
    terms: TermId[]
}

// future: build this on Relation
export default class Query {
    queryId: string
    terms = new Map<TermId, Term>()

    nextTermId = new IDSource()
    phases: RunPhase[] = []

    outputFrom: TermId

    [symValueType] = 'query'

    prependTerm(verb: string, tupleLike: TupleLike, flags = {}) {
        const tuple = toTuple(tupleLike);
        const id = this.nextTermId.take();
        this.terms.set(id, { id, verb, flags, tuple });
        this.phases.unshift({terms: [id]});
        return id;
    }

    addTerm(verb: string, tupleLike: TupleLike, flags = {}) {
        const tuple = toTuple(tupleLike);
        const id = this.nextTermId.take();
        this.terms.set(id, { id, verb, flags, tuple });
        this.phases.push({terms: [id]});
        return id;
    }

    addTermFromTuple(tupleLike: TupleLike) {
        let tuple = toTuple(tupleLike);
        let verb: string;

        if (tuple.hasAttr('verb')) {
            verb = tuple.getValue('verb');
            tuple = tuple.removeAttr('verb');
        } else {
            verb = tuple.tags[0].attr;
            tuple = tuple.removeTagAtIndex(0);
        }

        const term = this.addTerm(verb, tuple);
        this.setOutput(term);
    }

    connectAsInput(input: TermId, consumer: TermId) {
        this.terms.get(consumer).stdinFrom = input;
    }

    setOutput(output: TermId) {
        this.outputFrom = output;
    }

    stringify() {
        return this.phases.map(phase =>
            phase.terms.map(termId => {
                const term = this.terms.get(termId);
                return term.verb + ' ' + term.tuple.stringify();
            }).join(', ')).join(' | ');
    }
}

export function queryFromOneTuple(tuple: Tuple) {

    const q = new Query();
    q.addTermFromTuple(tuple);
    return q;
}

export function queryFromTupleArray(tuples: Tuple[]) {
    const q = new Query();
    for (const t of tuples)
        q.addTermFromTuple(t);
    return q;
}

export function runQueryV2(cxt: QueryContext, query: Query, overallOutput: Stream) {
    if (!query.outputFrom)
        throw new Error("runQueryV2 - query has no output defined");

    // Validation
    /*
    for (const { verb } of query.terms.values()) {
        if (!builtinVerbs[verb] && !cxt.graph.definedVerbs[verb]) {
            emitCommandError(overallOutput, "unrecognized verb: " + verb);
            overallOutput.done();
            return;
        }
    }*/

    const inputPipes = new Map<TermId, Pipe>();
    const outputPipes = new Map<TermId, Pipe>();

    // Initialize output pipes
    for (const id of query.terms.keys()) {
        outputPipes.set(id, new Pipe());
    }

    // Initialize input pipes
    for (const id of query.terms.keys()) {
        const inputPipe = new Pipe()
        inputPipes.set(id, inputPipe);

        const stdinFrom = query.terms.get(id).stdinFrom;

        if (!stdinFrom) {
            inputPipe.done();
        } else {
            outputPipes.get(stdinFrom).sendTo(inputPipe);
        }
    }

    outputPipes.get(query.outputFrom).sendTo({
        next(t:Tuple) {
            overallOutput.next(t);
        },
        done() {
            overallOutput.done();
            cxt.graph && cxt.graph.flushPendingChangeEvents();
        }
    });

    for (const { id, verb, tuple, flags } of query.terms.values()) {
        const input = inputPipes.get(id);
        const output = outputPipes.get(id);
        runOneCommand(cxt, { verb, tuple, input, output, flags });
    }
}

export function isQuery(val: any) {
    return val && val[symValueType] === 'query'
}
