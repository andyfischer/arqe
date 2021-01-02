
import Query from './Query'
import QueryContext from './QueryContext'
import Stream from './Stream'
import Tuple from './Tuple'
import Pipe from './Pipe'
import { builtinVerbs } from './everyVerb'
import { termToSearchPattern } from './Query'
import { emitCommandError, emitCommandOutputFlags } from './CommandUtils'
import CommandParams from './CommandParams'

type QueryTermId = string;

function verbForTerm(term: Tuple) {

    const verb = term.getValue('verb');

    if (verb && builtinVerbs[verb])
        return verb;

    return 'get';
}

export function runQuery(cxt: QueryContext, query: Query, overallOutput: Stream) {

    const inputPipes = new Map<QueryTermId, Pipe>();
    const outputPipes = new Map<QueryTermId, Pipe>();

    interface Step {
        input: Pipe
        output: Pipe
        scope: QueryContext
        verb: string
        tuple: Tuple
        searchPattern: Tuple,
        flags: any
        queryTerm: Tuple
    }

    const steps: Step[] = [];

    // Initialize steps
    for (const term of query.body()) {

        const verb = verbForTerm(term);
        const input = new Pipe();

        const localScope = cxt.newChild();
        localScope.verb = verb;
        localScope.input = input;

        steps.push({
            input,
            output: new Pipe(),
            scope: localScope,
            flags: term.getOptional('flags', null),
            verb,
            searchPattern: termToSearchPattern(term),
            tuple: termToSearchPattern(term),
            queryTerm: term,
        });
    }

    // Hook up input pipes
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {

        const step = steps[stepIndex];
        const previousStep = steps[stepIndex - 1];

        if (previousStep) {
            previousStep.output.sendTo(step.input);
        } else {
            step.input.done();
        }
    }

    // Handle the last output.
    if (steps.length > 0) {
        steps[steps.length-1].output.sendTo({
            next(t:Tuple) {
                overallOutput.next(t);
            },
            done() {
                overallOutput.done();
                cxt.graph && cxt.graph.flushPendingChangeEvents();
            }
        });
    }

    // Run everything
    for (const step of steps) {
        runSingleTerm(step);
    }
}

export function runSingleTerm(params: CommandParams) {
    emitCommandOutputFlags(params.flags, params.output);

    try {
        let verbHandler = builtinVerbs[params.verb];
        verbHandler(params);
        return;

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(params.output, "unhandled exception in runOneCommand: " + (err.stack || err));
        params.output.done();
    }
}
