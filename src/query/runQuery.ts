
import { prepareQuery, PreparedQuery } from './prepareQuery'
import Query from '../Query'
import Pipe from '../Pipe'
import QueryContext from '../QueryContext'
import { emitCommandError, emitCommandOutputFlags } from '../CommandUtils'
import { builtinVerbs } from '../verbs/_directory'
import CommandParams from '../CommandParams'

export function runQuery(scope: QueryContext, query: Query, overallInput: Pipe) {

    const prepared: PreparedQuery = prepareQuery(scope, query);

    overallInput.sendTo(prepared.steps[0].input);

    for (const step of prepared.steps) {

        runSingleTerm({
            verb: step.term.verb,
            scope: step.scope,
            tuple: step.term.params,
            flags: step.term.flags || {},
            input: step.input,
            output: step.output
        });
    }

    return prepared.output;
}

export function runSingleTerm(params: CommandParams) {
    emitCommandOutputFlags(params.flags, params.output);

    try {
        let verbHandler = builtinVerbs[params.verb];
        if (!verbHandler)
            throw new Error("internal error, verb not found: " + params.verb);

        verbHandler(params);
        return;

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(params.output, "unhandled exception in runSingleTerm: " + (err.stack || err));
        params.output.done();
    }
}
