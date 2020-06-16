
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
import { ReceiverFunc, TupleReceiverFunc } from './TableInterface'

type SlotReceiverFunc = ReceiverFunc<{slotId: string, tuple: Tuple}>
type TableSlotReceiverFunc = ReceiverFunc<{table: Table, slotId: string, tuple: Tuple}>

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

    scan(plan: QueryPlan, receiver: TableSlotReceiverFunc) {
        const searchPattern = plan.filterPattern || plan.tuple;
        if (!searchPattern)
            throw new Error('missing filterPattern or tuple');

        let pendingCount = plan.searchTables.length;

        for (const table of plan.searchTables) {
            table.scan((slot) => {
                if (slot === null) {
                    pendingCount--;
                    if (pendingCount === 0)
                        receiver(null);
                    return;
                }

                const { slotId, tuple } = slot;
                if (searchPattern.isSupersetOf(slot.tuple))
                    receiver({ table, slotId, tuple });
            });
        }
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
        this.scan(plan, (tableSlot) => {
            if (!found) {
                if (tableSlot === null) {
                    // Not saved, insert
                    if (!found)
                        this.insertConfirmedNotExists(plan);
                } else {
                    // Already saved - No-op.
                    found = true;
                    output.relation(plan.tuple);
                    output.finish();
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

        const slotId = table.nextSlotId.take();
        table.set(slotId, plan.tuple);
        output.relation(plan.tuple);

        if (!plan.tableName) {
            emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
            output.finish();
            return;
        }

        this.graph.onTupleUpdated(plan.tuple);
        output.finish();
    }

    update(plan: QueryPlan) {
        const { tuple, output } = plan;
        const graph = this.graph;

        const changeOperation = tuple;
        let hasFoundAny = false;

        // Apply the modificationCallback to every matching slot.

        this.scan(plan, (tableSlot) => {
            if (tableSlot) {
                const { slotId, table } = tableSlot;
                const found = tableSlot.tuple;

                const modified = plan.modificationCallback(found);
                table.set(slotId, modified);
                graph.onTupleUpdated(modified);
                output.relation(modified);
                hasFoundAny = true;

            } else {

                // Check if the plan has 'initializeIfMissing' - this means we must insert the row
                // if no matches were found.
                if (!hasFoundAny && plan.initializeIfMissing) {
                    plan.tuple = toInitialization(tuple);
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

        this.scan(plan, (tableSlot) => {
            if (tableSlot) {
                const { table, slotId, tuple } = tableSlot;
                table.delete(slotId);
                graph.onTupleDeleted(tuple);
                output.relation(tuple.addTagObj(newTag('deleted')));
            } else {
                output.finish();
            }
        });
    }

    select(plan: QueryPlan) {
        const { tuple, output } = plan;

        this.scan(plan, (tableSlot) => {
            if (tableSlot) {
                const { tuple } = tableSlot;
                output.relation(tuple);
            } else {
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
