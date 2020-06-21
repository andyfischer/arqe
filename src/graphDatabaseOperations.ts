
import Tuple from './Tuple'
import Graph from './Graph'
import QueryPlan from './QueryPlan'
import PatternTag, { newTag } from './PatternTag'
import { emitCommandError } from './CommandMeta'
import GenericStream, { StreamCombine } from './GenericStream'
import TableInterface from './TableInterface'
import { combineStreams } from './StreamUtil'
import Stream from './Stream'

export type ScanOutput = GenericStream<{table: TableInterface, slotId: string, tuple: Tuple}>

export function search(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = combineStreams(out);
    const startedAllTables = combined();

    for (const table of plan.searchTables) {
        table.search(searchPattern, combined());
    }

    startedAllTables.done();
}
export function scan(graph: Graph, plan: QueryPlan, out: ScanOutput) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = new StreamCombine<{table, slotId, tuple}>(out);
    const iteratedTables = combined.receive();

    for (const table of plan.searchTables) {
        const tableOut = combined.receive();

        try {
            table.scan({
                receive({slotId, tuple}) {
                    if (searchPattern.isSupersetOf(tuple))
                        tableOut.receive({ table, slotId, tuple });
                },
                finish() {
                    tableOut.finish();
                }
            });
        } catch (err) {
            console.error("unhandled error calling table.scan ", {
                err,
                searchPattern: searchPattern.str(),
                tableName: table.name
            })
        }
    }

    iteratedTables.finish();
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

    table.insert(plan.tuple, {
        next: output.next,
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
        table.updatev2(searchPattern, plan.modificationCallback, collectOutput());
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
        table.deletev2(searchPattern, collectOutput());
    }
    allTables.done();
}
