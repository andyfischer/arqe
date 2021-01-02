
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { combineStreams } from '../StreamUtil'
import Tuple from '../Tuple'
import { emitCommandError } from '../CommandUtils'
import { runQuery } from '../runQuery'
import { toQuery } from '../coerce'
import { joinNStreams_v2 } from '../StreamUtil'

export default function runQueryCommand(params: CommandParams) {

    const { scope } = params;

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

            for (const liveQuery of scope.eachWatchingQuery()) {
                liveQuery.usedDynamicQueryDuringEval(scope, query);
            }

            runQuery(scope, query, queryOut);
        },
        done() {
            allQueries.done();
        }
    });

    params.input.sendTo(combined);
    scope.graph.run(params.tuple.setValue('verb', 'get'), combined);
}
