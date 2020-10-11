
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { combineStreams } from '../StreamUtil'
import { getSearchAndInputCombined } from '../CommandUtils'
import Tuple from '../Tuple'
import { emitCommandError } from '../CommandUtils'
import { runQueryV2 } from '../Query'
import { toQuery } from '../coerce'

export default function runQueryCommand(cxt: QueryContext, params: CommandParams) {

    const collector = combineStreams(params.output);
    const allQueries = collector();

    getSearchAndInputCombined(cxt, params, {
        next(t: Tuple) {
            if (t.isCommandMeta()) {
                params.output.next(t);
                return;
            }

            if (!t.getVal('query')) {
                emitCommandError(params.output, "'query' not found: " + t.stringify());
                return;
            }

            const queryInput = t.getVal("query");
            const query = toQuery(queryInput);
            const queryOut = collector();

            for (const liveQuery of cxt.eachWatchingQuery()) {
                liveQuery.usedDynamicQueryDuringEval(cxt, query);
            }

            runQueryV2(cxt, query, queryOut);

        },
        done() {
            allQueries.done();
        }
    })
}
