
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import planQuery from '../planQuery'
import { emitSearchPatternMeta, emitCommandError } from '../CommandMeta'
import QueryPlan from '../QueryPlan'
import { combineStreams } from '../StreamUtil'
import TableMount from '../TableMount'
import { callNativeHandler } from '../NativeHandler'

function findForHandlerMatches(pattern: Tuple, tuple: Tuple) {
    // We can use this handler if we have definite values for each expected attr.
    for (const tag of pattern.tags) {
        const found = tuple.findTagForType(tag.attr);
        if (!found || !found.fixedValue())
            return false;
    }
    return true;
}

export function selectOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    if (table.call('get', tuple, out))
        return;

    if (table.call('select', tuple, out))
        return;

    // Check for a compatible 'find-with' handler.
    const findWithHandler = table.handlers.find('find-with', tuple);
    if (findWithHandler) {
        callNativeHandler(findWithHandler, tuple, out);
        return;
    }

    // Use the 'list-all' handler if provided.
    const listAllHandler = table.handlers.find('list-all', tuple);
    if (listAllHandler) {
        callNativeHandler(listAllHandler, tuple, {
            next(t: Tuple) {
                if (tuple.isSupersetOf(t))
                    out.next(t);
            },
            done() { out.done() }
        });
        return;
    }

    // Fail
    emitCommandError(out, `No handler found on table '${table.name}' for command: ${tuple.stringify()}`);
    out.done();
}

export function select(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.tuple;
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
