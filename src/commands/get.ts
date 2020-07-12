
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import planQuery from '../planQuery'
import { emitSearchPatternMeta, emitCommandError } from '../CommandMeta'
import QueryPlan from '../QueryPlan'
import { combineStreams } from '../StreamUtil'
import TableMount from '../TableMount'

export function selectOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    if (table.call('get', tuple, out))
        return;

    table.callOrError('select', tuple, out);
}

export function select(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = combineStreams(out);
    const startedAllTables = combined();

    for (const table of plan.searchTables) {
        selectOnTable(table, searchPattern, combined());
    }

    startedAllTables.done();
}


export default function get(graph: Graph, pattern: Tuple, output: Stream) {
    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    emitSearchPatternMeta(pattern, output);
    select(graph, plan, output);
}
