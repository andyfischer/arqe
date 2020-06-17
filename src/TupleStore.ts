
import Tuple from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import SearchOperation from './SearchOperation'
import TupleReceiver from './TupleReceiver'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'
import QueryPlan, { QueryTag } from './QueryPlan'
import Table from './Table'
import { parsePattern } from './parseCommand'
import TuplePatternMatcher from './TuplePatternMatcher'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import { ReceiverFunc, TupleReceiverFunc, ReceiverCombine, TupleReceiverCombine } from './ReceiverFunc'
import CombineTupleStreams from './CombineTupleStreams'

type SlotReceiverFunc = ReceiverFunc<{slotId: string, tuple: Tuple}>
type TableSlotReceiverFunc = ReceiverFunc<{table: Table, slotId: string, tuple: Tuple}>
import { Stream } from './TableInterface'

function isThenable(result: any) {
    return result.then !== undefined;
}

function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

export default class TupleStore {
    graph: Graph

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    nextSlotId: IDSource = new IDSource();

    _tables = new Map<string, Table>()
    tablePatternMap = new TuplePatternMatcher<Table>();

    constructor(graph: Graph) {
        this.graph = graph;

        this.defineTable('table_schema', parsePattern("table(*) schema"));
    }

    findTable(name: string): Table {
        return this._tables.get(name) || null;
    }

    defineTable(name: string, pattern: Pattern) {
        if (this._tables.has(name))
            throw new Error("table already exists: " + name)

        const table = new Table(name, pattern);
        this._tables.set(name, table);
        this.tablePatternMap.add(pattern, table);
        return table;
    }

    resolveExpressionValuesForInsert(rel: Tuple) {
        return rel.remapTags((tag: PatternTag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniquePerAttr[tag.attr])
                    this.nextUniquePerAttr[tag.attr] = new IDSource();

                return tag.setValue(this.nextUniquePerAttr[tag.attr].take());
            }

            return tag;
        });
    }

    scan(plan: QueryPlan, out: Stream<{table: Table, slotId: string, tuple: Tuple}>) {
        const searchPattern = plan.filterPattern || plan.tuple;
        if (!searchPattern)
            throw new Error('missing filterPattern or tuple');

        let pendingCount = plan.searchTables.length;

        for (const table of plan.searchTables) {
            table.scan({
                receive({slotId, tuple}) {
                    if (searchPattern.isSupersetOf(tuple))
                        out.receive({ table, slotId, tuple });
                },
                finish() { }
            });
        }

        out.finish()
    }

    insert(plan: QueryPlan) {
        const { output } = plan; 

        // Save as new row
        plan.tuple = this.resolveExpressionValuesForInsert(plan.tuple);

        for (const tag of plan.tuple.tags) {
            if (tag.valueExpr) {
                emitCommandError(output, "TupleStore unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }

        // Check if this tuple is already saved.
        let found = false;
        this.scan(plan, {
            receive() {
                // Already saved - No-op.
                if (!found) {
                    found = true;
                    output.relation(plan.tuple);
                    output.finish();
                }
            },
            finish: () => {
                if (!found) {
                    // Not saved, insert
                    this.insertConfirmedNotExists(plan);
                }
            }
        });
    }

    insertConfirmedNotExists(plan: QueryPlan) {

        const { output } = plan; 

        // Store a new tuple.
        const table = plan.table;

        if (!plan.table)
            throw new Error("Internal error, missing table in insert()")

        if (!plan.tableName) {
            emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
            output.finish();
            return;
        }

        const slotId = table.nextSlotId.take();
        table.set(slotId, plan.tuple, {
            relation() {},
            finish: () => {
                output.relation(plan.tuple);
                this.graph.onTupleUpdated(plan.tuple);
                output.finish();
            }
        });
    }

    update(plan: QueryPlan) {
        const { output } = plan;
        const graph = this.graph;

        let hasFoundAny = false;

        // Apply the modificationCallback to every matching slot.

        this.scan(plan, {
            receive({slotId, table, tuple}) {

                const found = tuple;

                const modified = plan.modificationCallback(found);
                table.set(slotId, modified, {
                    relation() {},
                    finish() {
                        graph.onTupleUpdated(modified);
                        output.relation(modified);
                        hasFoundAny = true;
                    }
                });
            },
            finish: () => {

                // TODO- This needs to wait until after the set() calls have finished.

                // Check if the plan has 'initializeIfMissing' - this means we must insert the row
                // if no matches were found.
                if (!hasFoundAny && plan.initializeIfMissing) {
                    plan.tuple = toInitialization(plan.tuple);
                    this.insert(plan);
                } else {
                    output.finish();
                }
            }
        });
    }

    doDelete(plan: QueryPlan) {
        const { output } = plan;
        const graph = this.graph;

        const combineDeletes = new CombineTupleStreams({
            relation(t: Tuple) { },
            finish() { output.finish() }
        });

        const scanFinished = combineDeletes.receive();

        this.scan(plan, {
            receive({table, slotId, tuple}) {

                const onFinishedDelete = combineDeletes.receive();

                table.delete(slotId, {
                    relation(t) {},
                    finish() {
                        graph.onTupleDeleted(tuple);
                        output.relation(tuple.addTagObj(newTag('deleted')));
                        onFinishedDelete.finish()
                    }
                });
            },
            finish() {
                scanFinished.finish();
            }
        });
    }

    select(plan: QueryPlan) {
        const { tuple, output } = plan;

        this.scan(plan, {
            receive({tuple}) {
                output.relation(tuple);
            },
            finish() {
                output.finish();
            }
        });
    }

    save(plan: QueryPlan) {
        
        maybeCreateImplicitTable(this, plan);

        if (plan.isDelete) {
            this.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }
}
