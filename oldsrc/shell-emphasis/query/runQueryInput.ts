
import { Snapshot } from '../framework'
import parseQueryStructure from '../parse-query/parseQueryStructure'
import runOneQuery from './runOneQuery'
import { print } from '../utils'
import QueryOptions from './QueryOptions'
import { parseQueryInput } from '../parse-query'
import QueryResult from './QueryResult'

const verbose = !!process.env.verbose;

export default async function runInput(snapshot: Snapshot, input: string, opts?: QueryOptions): Promise<QueryResult> {
    if (typeof input !== 'string')
        throw new Error("query must be a string, got: " + input);

    if (verbose)
        print('running input: ' + input);

    let lastContext: QueryResult = null;

    for (const syntax of parseQueryInput(input, { filename: opts && opts.sourceFilename } )) {

        const query = parseQueryStructure(snapshot, syntax);

        if (opts && opts.isInteractive) {
            query.isInteractive = true;
        }

        if (opts && opts.sourceFilename) {
            query.syntax.sourcePos.filename = opts.sourceFilename;
        }

        query.snapshot = snapshot;

        lastContext = await runOneQuery(snapshot, query);
    }

    return lastContext;
}
