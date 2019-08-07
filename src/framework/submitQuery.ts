
import { Snapshot } from '.'
import { parseQuery, Query } from '..'
import applyQueryToReducer from './applyQueryToReducer'
import { runCommand, Reducer } from '../framework'
import { everyCommand } from '../framework/declareCommand'
import { print, values, timedOut } from '../utils'
import printResponseToTerminal from './printResponseToTerminal'

const verbose = !!process.env.verbose;

export interface QueryOptions {
    isInteractive?: boolean
}

function queryRespond(query: Query) {

    let hasResponded = false;
    const startTime = Date.now();
    let promiseResolve = null;
    query.promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
    });
    
    return (data) => {
        const elapsed = Date.now() - startTime;

        if (hasResponded)
            print('warning: double response for query: ' + query.syntax.originalStr);

        if (elapsed > 500)
            print('warning: slow response for query: ' + query.syntax.originalStr);

        if (query.isInteractive)
            printResponseToTerminal(query, data);

        hasResponded = true;
        promiseResolve();
    }
}

export default async function submitQuery(snapshot: Snapshot, input: string, opts?: QueryOptions) {
    if (typeof input !== 'string')
        throw new Error("query must be a string, got: " + input);

    if (verbose)
        print('running query: ' + input);

    const query = parseQuery(input, snapshot);

    if (opts && opts.isInteractive) {
        query.isInteractive = true;
    }

    query.respond = queryRespond(query);

    for (const doc of snapshot.liveDocuments)
        applyQueryToReducer(snapshot, doc, query);

    if (query.command) {
        runCommand(query);
    }
}
