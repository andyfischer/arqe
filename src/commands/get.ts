
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import planQuery from '../planQuery'
import { emitSearchPatternMeta, emitCommandError } from '../CommandMeta'
import QueryPlan from '../QueryPlan'
import { combineStreams } from '../StreamUtil'
import TableMount from '../TableMount'
import findPartitionsByTable from '../findPartitionsByTable'

export function selectOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    if (table.callWithDefiniteValues('get', tuple, out))
        return;

    if (table.callWithDefiniteValues('select', tuple, out))
        return;

    // Check for a compatible 'find-with' handler.
    const findWithHandler = table.handlers.find('find-with', tuple);
    if (findWithHandler) {
        findWithHandler(tuple, out);
        return;
    }

    // Use the 'list-all' handler if provided.
    const listAllHandler = table.handlers.find('list-all', tuple);
    if (listAllHandler) {
        listAllHandler(tuple, {
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

function maybeAnnotateWithIdentifiers(searchPattern: Tuple, out: Stream) {
    let hasAnyIdentifiers = false;
    const attrToIdentifier = {};

    for (const tag of searchPattern.tags) {
        if (tag.hasIdentifier()) {
            hasAnyIdentifiers = true;
            attrToIdentifier[tag.attr] = tag.identifier;
        }
    }

    if (!hasAnyIdentifiers)
        return out;

    return {
        next(t) {
            out.next(t.remapTags(tag => {
                if (!tag.attr)
                    return tag;

                const ident = attrToIdentifier[tag.attr];
                if (ident) {
                    return tag.setIdentifier(ident);
                }

                return tag;
            }))
        },
        done() {
            out.done()
        }
    }
}

export function select(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    out = maybeAnnotateWithIdentifiers(searchPattern, out);

    const combined = combineStreams(out);
    const startedAllTables = combined();

    for (const [table, partitionedTuple] of findPartitionsByTable(graph, searchPattern)) {
        const tableOut = combined();
        selectOnTable(table, partitionedTuple, tableOut);
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
