
import Query from './Query'
import QueryContext from './QueryContext'
import Stream from './Stream'
import Tuple from './Tuple'
import Pipe from './Pipe'
import { builtinVerbs } from './everyVerb'
import { emitCommandError, emitCommandOutputFlags } from './CommandUtils'
import CommandParams from './CommandParams'

type QueryTermId = string;

export function extractVerbForTerm(term: Tuple) {

    if (term.hasValue('verb')) {
        return {
            verb: term.getValue('verb'),
            termInput: term.removeAttr('verb')
        }
    }

    for (const attr of term.attrs()) {
        if (builtinVerbs[attr]) {
            return {
                verb: attr,
                termInput: term.removeAttr(attr)
            }
        }
    }

    return {
        verb: 'get',
        termInput: term
    }
}

export function runQuery(scope: QueryContext, query: Query, overallInput: Pipe) {

    const overallOutput = new Pipe('runQuery');

    interface Step {
        input: Pipe
        output: Pipe
        scope: QueryContext
        verb: string
        tuple: Tuple
        searchPattern: Tuple,
        flags: any
    }

    const steps: Step[] = [];

    // Initialize steps
    for (const term of query.body()) {

        const { verb, termInput } = extractVerbForTerm(term);
        const input = new Pipe('queryStepInput');

        const localScope = scope.newChild();
        localScope.verb = verb;
        localScope.input = input;

        steps.push({
            input,
            output: new Pipe('queryStepOutput - ' + term.stringify()),
            scope: localScope,
            flags: term.getOptional('flags', null),
            verb,
            searchPattern: termInput,
            tuple: termInput,
        });
    }

    if (steps.length === 0)
        throw new Error("zero steps in runQuery..")

    // Hook up input pipes
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {

        const step = steps[stepIndex];
        const previousStep = steps[stepIndex - 1];

        if (previousStep) {
            previousStep.output.sendTo(step.input);
        } else {
            overallInput.sendTo(step.input);
        }
    }

    // Handle the last output.
    if (steps.length > 0) {
        const lastOutputPipe = steps[steps.length - 1].output;
        lastOutputPipe.sendTo(overallOutput);
    }

    // Run everything
    for (const step of steps) {
        runSingleTerm(step);
    }

    return overallOutput;
}

export function runSingleTerm(params: CommandParams) {
    emitCommandOutputFlags(params.flags, params.output);

    try {
        let verbHandler = builtinVerbs[params.verb];
        verbHandler(params);
        return;

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(params.output, "unhandled exception in runSingleTerm: " + (err.stack || err));
        params.output.done();
    }
}
