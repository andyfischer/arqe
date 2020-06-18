
import Tuple from './Tuple'
import Graph from './Graph'
import QueryPlan from './QueryPlan'
import PatternTag, { newTag } from './PatternTag'
import { emitCommandError } from './CommandMeta'
import { GenericStream, StreamCombine } from './TableInterface'
import TableInterface from './TableInterface'
import { combineStreams } from './StreamUtil'

export type ScanOutput = GenericStream<{table: TableInterface, slotId: string, tuple: Tuple}>

export function scan(graph: Graph, plan: QueryPlan, out: ScanOutput) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = new StreamCombine<{table, slotId, tuple}>(out);
    const iteratedTables = combined.receive();

    for (const table of plan.searchTables) {
        const tableOut = combined.receive();

        table.scan({
            receive({slotId, tuple}) {
                if (searchPattern.isSupersetOf(tuple))
                    tableOut.receive({ table, slotId, tuple });
            },
            finish() {
                tableOut.finish();
            }
        });
    }

    iteratedTables.finish();
}

export function insert(graph: Graph, plan: QueryPlan) {
    const { output } = plan; 

    // Save as new row
    plan.tuple = graph.resolveExpressionValuesForInsert(plan.tuple);

    for (const tag of plan.tuple.tags) {
        if (tag.valueExpr) {
            emitCommandError(output, "insert unhandled expression: " + tag.stringify());
            output.done();
            return;
        }
    }

    // Check if this tuple is already saved.
    let found = false;
    graph.scan(plan, {
        receive() {
            // Already saved - No-op.
            if (!found) {
                found = true;
                output.next(plan.tuple);
                output.done();
            }
        },
        finish: () => {
            if (!found) {
                // Not saved, insert
                insertConfirmedNotExists(graph, plan);
            }
        }
    });
}

function insertConfirmedNotExists(graph: Graph, plan: QueryPlan) {

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

    const addToResult = combineStreams({
        next: output.next,
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

    const scanStream = addToResult();

    scan(graph, plan, {
        receive({slotId, table, tuple}) {
            const found = tuple;

            const modified = plan.modificationCallback(found);
            const setOutput = addToResult();

            table.update(slotId, modified, {
                next() {},
                done() {
                    graph.onTupleUpdated(modified);
                    hasFoundAny = true;
                    setOutput.next(modified);
                    setOutput.done();
                }
            });
        },
        finish() {
            scanStream.done();
        }
    });
}

export function del(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const addToOutput = combineStreams(output);

    const scanFinished = addToOutput();

    scan(graph, plan, {
        receive({table, slotId, tuple}) {
            const deleteResult = addToOutput();

            table.delete(slotId, {
                next: deleteResult.next,
                done() {
                    graph.onTupleDeleted(tuple);
                    output.next(tuple.addTagObj(newTag('deleted')));
                    deleteResult.done()
                }
            });
        },
        finish() {
            scanFinished.done();
        }
    });
}
