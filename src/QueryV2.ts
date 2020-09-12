
import Tuple from './Tuple'
import IDSource from './utils/IDSource'
import ParsedQuery, { QueryFlags } from './ParsedQuery'
import Stream from './Stream'
import Graph from './Graph'
import QueryContext from './QueryContext'
import Pipe from './Pipe'
import runOneCommand from './runOneCommand'
import { ValidCommands } from './CommandDb'
import { emitCommandError } from './CommandMeta'

export type TermId = string

interface Term {
    id: TermId
    verb: string
    flags: QueryFlags
    tuple: Tuple
    stdinFrom?: TermId
}

interface RunPhase {
    terms: TermId[]
}

export default class QueryV2 {
    queryId: string
    terms = new Map<TermId, Term>()

    nextTermId = new IDSource()
    phases: RunPhase[] = []

    outputFrom: TermId

    addTerm(verb: string, tuple: Tuple, flags = {}) {
        const id = this.nextTermId.take();
        this.terms.set(id, {
            id,
            verb,
            flags,
            tuple
        });

        this.phases.push({terms: [id]});
        return id;
    }

    connectAsInput(input: TermId, consumer: TermId) {
        this.terms.get(consumer).stdinFrom = input;
    }

    setOutput(output: TermId) {
        this.outputFrom = output;
    }
}

export function runQueryV2(graph: Graph, query: QueryV2, overallOutput: Stream) {
    if (!query.outputFrom)
        throw new Error("runQueryV2 - query has no output defined");

    // Validation
    for (const { verb } of query.terms.values()) {
        if (!ValidCommands[verb]) {
            emitCommandError(overallOutput, "unrecognized verb: " + verb);
            overallOutput.done();
            return;
        }
    }

    const cxt = new QueryContext(graph);

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

            graph.flushPendingChangeEvents();
        }
    });

    for (const { id, verb, tuple, flags } of query.terms.values()) {
        const input = inputPipes.get(id);
        const output = outputPipes.get(id);
        runOneCommand(cxt, { verb, tuple, input, output, flags });
    }
}
