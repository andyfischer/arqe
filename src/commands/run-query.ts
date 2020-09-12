
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { combineStreams } from '../StreamUtil'
import { getSearchAndInputCombined } from '../CommandUtils'
import Tuple from '../Tuple'
import { emitCommandError } from '../CommandMeta'

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

            const query = t.getVal("query");
            
            const queryOut = collector();
            cxt.graph.run(query, queryOut);
        },
        done() {
            allQueries.done();
        }
    })
}
