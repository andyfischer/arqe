
import { Query, QueryResult } from '.'
import printResponseToTerminal from '../framework/printResponseToTerminal'
import applyQueryToReducer from '../framework/applyQueryToReducer'
import { runCommand, Reducer, Snapshot } from '../framework'
import { print, values, timedOut } from '../utils'
import runQueryInput from './runQueryInput'

function queryRespond(query: Query, result: QueryResult) {

    let hasResponded = false;
    const startTime = Date.now();
    let promiseResolve = null;
    query.promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
    });
    
    return (data) => {
        const elapsed = Date.now() - startTime;

        if (hasResponded) {
            print('warning: double response for query: ' + query.syntax.originalStr);
            return;
        }

        if (elapsed > 500)
            print('warning: slow response for query: ' + query.syntax.originalStr);

        if (query.isInteractive)
            printResponseToTerminal(query, data);

        result.frame = data;

        hasResponded = true;
        promiseResolve();
    }
}

export default async function runOneQuery(snapshot: Snapshot, query: Query): Promise<QueryResult> {

    const result: QueryResult = { frame: {} }

    query.respond = queryRespond(query, result);
    query.subQuery = (str) => runQueryInput(snapshot, str, { isInteractive: false });

    for (const doc of snapshot.liveDocuments)
        applyQueryToReducer(snapshot, doc, query);

    if (query.command) {
        runCommand(query);
    }

    return result;
}
