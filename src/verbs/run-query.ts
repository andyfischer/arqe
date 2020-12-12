
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { combineStreams } from '../StreamUtil'
import Tuple from '../Tuple'
import { emitCommandError } from '../CommandUtils'
import { runQuery } from '../Query'
import { toQuery } from '../coerce'
import { joinNStreams_v2 } from '../StreamUtil'

export default function runQueryCommand(cxt: QueryContext, params: CommandParams) {

    const collector = combineStreams(params.output);
    const allQueries = collector();

    const combined = joinNStreams_v2(2, {
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

            runQuery(cxt, query, queryOut);
        },
        done() {
            allQueries.done();
        }
    });

    params.input.sendTo(combined);
    cxt.graph.run(params.tuple.setValue('verb', 'get'), combined);
}
