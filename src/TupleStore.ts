
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
import findStored from './findStored'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import { TupleReceiverFunc } from './TableInterface'

interface Slot {
    relation: Tuple
}

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

    scan(plan: QueryPlan, receiver: TupleReceiverFunc) {
        /*
        const searchPattern = plan.filterPattern || plan.tuple;
        if (!searchPattern)
            throw new Error('missing filterPattern or tuple');

        let pendingCount = plan.searchPattern.length;
        for (const table of plan.searchTables) {
            table.scan((done, slot) => {
                if (done) {
                    pendingCount--;
                    if (pendingCount === 0)
                        receiver(true);
                    return;
                }

                if (searchPattern.isSupersetOf(slot.tuple))

            });
        }
        */
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
        for (const existing of findStored(this, plan)) {
            // Already saved - No-op.
            output.relation(plan.tuple);
            output.finish();
            return;
        }

        this.insertConfirmedNotExists(plan);
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
        for (const { slotId, found, table } of findStored(this, plan)) {
            const modified = plan.modificationCallback(found);
            table.set(slotId, modified);
            graph.onTupleUpdated(modified);
            output.relation(modified);
            hasFoundAny = true;
        }

        // Check if the plan has 'initializeIfMissing' - this means we must insert the row
        // if no matches were found.
        if (!hasFoundAny && plan.initializeIfMissing) {
            plan.tuple = toInitialization(tuple);
            this.insert(plan);
            return;
        }

        output.finish();
    }

    doDelete(plan: QueryPlan) {
        const { output } = plan;
        const graph = this.graph;

        for (const { slotId, found, table } of findStored(this, plan)) {
            table.delete(slotId);
            graph.onTupleDeleted(found);
            output.relation(found.addTagObj(newTag('deleted')));
        }

        output.finish();
    }

    select(plan: QueryPlan) {
        const { tuple, output } = plan;

        for (const { slotId, found } of findStored(this, plan)) {
            output.relation(found);
        }

        output.finish();
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
