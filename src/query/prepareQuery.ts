
import Query from '../Query'
import Tuple from '../Tuple'
import { builtinVerbs } from '../verbs/_directory'
import Pipe from '../Pipe'
import QueryContext from '../QueryContext'

export interface PreparedTerm {
    verb: string
    params: Tuple
    flags: any
}

export interface Step {
    input: Pipe
    output: Pipe
    scope: QueryContext
    term: PreparedTerm
}

export interface PreparedQuery {
    steps: Step[]
    output: Pipe
}

export function getPreparedTerm(term: Tuple): PreparedTerm {

    let verb;
    let params = term;
    let flags;

    if (term.hasValue('verb')) {
        verb = term.getValue('verb');
        params = params.removeAttr('verb');
    }

    if (!verb) {
        // See if any tags look like verbs.
        for (const attr of term.attrs()) {
            if (builtinVerbs[attr]) {
                verb = attr;
                params = params.removeAttr(attr);
                break;
            }
        }
    }

    if (!verb)
        verb = 'get'

    if (term.hasValue('flags')) {
        flags = term.getValue('flags');
        params = params.removeAttr('flags')
    }

    return {
        verb,
        params,
        flags
    }
}

export function prepareQuery(scope: QueryContext, query: Query) {

    const prepared: PreparedQuery = {
        steps: [],
        output: new Pipe('runQuery'),
    }

    for (const term of query.body()) {

        const preparedTerm = getPreparedTerm(term);

        const input = new Pipe('queryStepInput');

        const localScope = scope.newChild();

        localScope.verb = preparedTerm.verb;
        localScope.input = input;

        prepared.steps.push({
            input,
            output: new Pipe('queryStepOutput - ' + term.stringify()),
            scope: localScope,
            term: preparedTerm,
        });
    }

    if (prepared.steps.length === 0)
        throw new Error("zero steps in prepareQuery..")

    // Hook up input pipes.
    for (let stepIndex = 0; stepIndex < prepared.steps.length; stepIndex++) {

        const step = prepared.steps[stepIndex];
        const previousStep = prepared.steps[stepIndex - 1];

        if (previousStep) {
            previousStep.output.sendTo(step.input);
        }
    }

    // Handle the last output.
    if (prepared.steps.length > 0) {
        const lastOutputPipe = prepared.steps[prepared.steps.length - 1].output;
        lastOutputPipe.sendTo(prepared.output);
    }

    return prepared;
}
