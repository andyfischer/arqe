
import { Snapshot } from '.'
import { parseQuery, Query } from '../query'
import DocumentMount, { applyQueryToDocument } from './DocumentMount'
import { runCommand } from '../framework'
import { everyCommand } from '../framework/declareCommand'
import { print, values } from '../utils'
import { CommandDefinition } from '../documents/commandDatabase'

const verbose = !!process.env.verbose;

export default async function applyQuery(snapshot: Snapshot, queryString: string) {
    if (typeof queryString !== 'string')
        throw new Error("queryString must be a string, got: " + queryString);

    if (verbose)
        print('running query: ' + queryString);

    const query = parseQuery(queryString, snapshot);

    for (const doc of snapshot.liveDocuments) {
        applyQueryToDocument(snapshot, doc, query);
    }

    if (query.command) {
        await runCommand(snapshot, query);
    }
}
