
import Tuple, { objectToTuple } from './Tuple'
import Graph from './Graph'
import QueryPlan from './QueryPlan'
import PatternTag, { newTag } from './PatternTag'
import { emitCommandError } from './CommandMeta'
import TableStorage from './TableInterface'
import { combineStreams } from './StreamUtil'
import Stream from './Stream'
import NativeHandler, { callNativeHandler } from './NativeHandler'
import { insertPlanned, toInitialization } from './commands/insert'

export function selectOnTable(table: TableStorage, tuple: Tuple, out: Stream) {
    if (table.select) {
        table.select(tuple, out);
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
        selectOnTable(table.storage, searchPattern, combined());
    }

    startedAllTables.done();
}

export function update(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    let hasFoundAny = false;

    // Scan and apply the modificationCallback to every matching slot.

    const collectOutput = combineStreams({
        next: (t:Tuple) => {
            if (!t.isCommandMeta()) {
                hasFoundAny = true;
                graph.onTupleUpdated(t);
            }
            output.next(t);
        },
        done: () => {
            // Check if the plan has 'initializeIfMissing' - this means we must insert the row
            // if no matches were found.
            if (!hasFoundAny && plan.initializeIfMissing) {
                plan.tuple = toInitialization(plan.tuple);
                insertPlanned(graph, plan);
            } else {
                output.done();
            }
        }
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        table.storage.update(searchPattern, plan.modification, collectOutput());
    }

    allTables.done();
}

export function del(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const collectOutput = combineStreams({
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTagObj(newTag('deleted'));
            output.next(deletedMessage);
        },
        done: output.done
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        const tableOut = collectOutput();
        table.storage.delete(searchPattern, tableOut);
    }
    allTables.done();
}

