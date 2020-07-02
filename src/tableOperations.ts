
import Tuple from './Tuple'
import Graph from './Graph'
import QueryPlan from './QueryPlan'
import PatternTag, { newTag } from './PatternTag'
import { emitCommandError } from './CommandMeta'
import TableInterface from './TableInterface'
import { combineStreams } from './StreamUtil'
import Stream from './Stream'

export function search(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = combineStreams(out);
    const startedAllTables = combined();

    for (const table of plan.searchTables) {
        table.storage.search(searchPattern, combined());
    }

    startedAllTables.done();
}

export function insert(graph: Graph, plan: QueryPlan) {
    const { output } = plan; 

    // Store a new tuple.
    const table = plan.table;

    if (!plan.table)
        throw new Error("Internal error, missing table in insert()")

    if (!plan.tableName) {
        emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
        output.done();
        return;
    }

    table.storage.insert(plan.tuple, {
        next: t => {
            output.next(t);
        },
        done: () => {
            output.next(plan.tuple);
            graph.onTupleUpdated(plan.tuple);
            output.done();
        }
    });
}

function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
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
                insert(graph, plan);
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
