
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

    // Check for a compatible 'find-for' handler.
    for (const { pattern, handler } of table.handlersForCommand('find-for')) {
        if (findForHandlerMatches(pattern, tuple)) {
            callNativeHandler(handler, tuple, out);
            return;
        }
    }

    // Use 'find-all' handler if possible.
    const findAllHandler = table.handlersForCommand('find-all')[0];
    if (findAllHandler) {
        callNativeHandler(findAllHandler.handler, tuple, {
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
