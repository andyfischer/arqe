
import { Snapshot } from '.'
import { parseQuery, Query } from '../query'
import applyQueryToReducer from './applyQueryToReducer'
import { runCommand, Reducer } from '../framework'
import { everyCommand } from '../framework/declareCommand'
import { print, values } from '../utils'
import { CommandDefinition } from '../reducers/commandDatabase'

const verbose = !!process.env.verbose;

export interface QueryOptions {
    isInteractive?: boolean
}

export default async function applyQuery(snapshot: Snapshot, input: string, opts?: QueryOptions) {
    if (typeof input !== 'string')
        throw new Error("query must be a string, got: " + input);

    if (verbose)
        print('running query: ' + input);

    const query = parseQuery(input, snapshot);

    if (opts && opts.isInteractive)
        query.isInteractive = true;

    for (const doc of snapshot.liveDocuments)
        applyQueryToReducer(snapshot, doc, query);

    if (query.command)
        await runCommand(snapshot, query);
}
