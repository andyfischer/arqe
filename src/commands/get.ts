
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import CommandExecutionParams from '../CommandExecutionParams'
import planQuery from '../planQuery'
import { emitSearchPatternMeta, emitCommandError } from '../CommandMeta'
import TableStorage from '../TableStorage'
import { callNativeHandler } from '../NativeHandler'
import QueryPlan from '../QueryPlan'
import { combineStreams } from '../StreamUtil'
import TableMount from '../TableMount'

export function selectOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    if (table.storage.select) {
        table.storage.select(tuple, out);
        return;
    }

    if (table['search'])
        throw new Error('table should not have search: ' + table.name)

    if (table.handlers) {
        const getHandler = table.handlers.find('get', tuple);
        if (getHandler) {
            callNativeHandler(getHandler, tuple, out);
            return;
        }

        const selectHandler = table.handlers.find('select', tuple);
        if (selectHandler) {
            selectHandler.func(tuple, out);
            return;
        }
    }

    emitCommandError(out, "No select handler found on table " + table.name);
    out.done();
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
