
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
import PrimaryKey from './PrimaryKey'
import { parsePattern } from './parseCommand'

interface Slot {
    relation: Tuple
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

    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    slots: { [ slotId: string]: Tuple } = {};
    nextSlotId: IDSource = new IDSource();
    byTableName: { [tn: string]: { [slotId: string]: true } } = {}

    tables: { [ name: string ]: Table } = {}

    constructor(graph: Graph) {
        this.graph = graph;

        this.defineTable('table_schema', parsePattern("table/* schema"));
    }

    findTable(name: string): Table {
        return this.tables[name] || null;
    }

    defineTable(name: string, pattern: Pattern) {
        if (this.tables[name])
            throw new Error("table already exists: " + name)

        this.tables[name] = new Table(name, pattern);
    }

    resolveExpressionValues(rel: Tuple) {
        return rel.remapTags((tag: PatternTag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniqueIdPerType[tag.attr])
                    this.nextUniqueIdPerType[tag.attr] = new IDSource();

                return tag.setValue(this.nextUniqueIdPerType[tag.attr].take());
            }

            return tag;
        });
    }

    *findStored(tableName: string, search: Pattern): Iterable<{slotId:string, relation: Tuple, tableName: string}> {

        if (tableName) {
            const indexedStorageIds = this.byTableName[tableName] || {};

            for (const slotId in indexedStorageIds) {
                const relation = this.slots[slotId];
                if (search.isSupersetOf(relation))
                    yield { slotId, relation, tableName }
            }
            
            return;
        }

        // Full scan
        for (const slotId in this.slots) {
            const relation = this.slots[slotId];
            if (search.isSupersetOf(relation))
                yield { slotId, relation, tableName }
        }
    }

    insert(plan: QueryPlan) {
        const { pattern, output } = plan; 
        let relation = pattern;

        // Save as new relation
        relation = this.resolveExpressionValues(relation);

        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                emitCommandError(output, "TupleStore unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }

        // Check if this tuple is already saved.
        for (const existing of this.findStored(plan.tableName, relation)) {
            // Already saved - No-op.
            output.relation(relation);
            output.finish();
            return;
        }

        // Store a new tuple.
        const slotId = this.nextSlotId.take();
        this.slots[slotId] = relation;
        output.relation(relation);

        if (!plan.tableName) {
            emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.pattern.stringify());
            output.finish();
            return;
        }

        this.byTableName[plan.tableName] = this.byTableName[plan.tableName] || {};
        this.byTableName[plan.tableName][slotId] = true;
        this.graph.onTupleUpdated(relation);
        output.finish();
    }

    update(plan: QueryPlan) {
        const { pattern, output } = plan;
        const graph = this.graph;

        const changeOperation = pattern;
        let hasFoundAny = false;

        // Apply the modificationCallback to every matching slot.
        for (const { slotId, relation } of this.findStored(plan.tableName, plan.filterPattern)) {
            const modified = plan.modificationCallback(relation);
            this.slots[slotId] = modified;
            graph.onTupleUpdated(modified);
            output.relation(modified);
            hasFoundAny = true;
        }

        // Check if the plan has 'initializeIfMissing' - this means we must insert the row
        // if no matches were found.
        if (!hasFoundAny && plan.initializeIfMissing) {
            plan.pattern = toInitialization(pattern);
            this.insert(plan);
            return;
        }

        output.finish();
    }

    doDelete(plan: QueryPlan) {
        const { output } = plan;
        const graph = this.graph;

        for (const { slotId, relation, tableName } of this.findStored(plan.tableName, plan.filterPattern)) {
            delete this.slots[slotId];
            if (tableName) {
                delete (this.byTableName[tableName] || {})[slotId];
            }
            graph.onTupleDeleted(relation);
            output.relation(relation.addTagObj(newTag('deleted')));
        }

        output.finish();
    }

    select(plan: QueryPlan) {
        const { pattern, output } = plan;

        for (const { slotId, relation } of this.findStored(plan.tableName, pattern)) {
            output.relation(relation);
        }

        output.finish();
    }

    save(plan: QueryPlan) {
        if (plan.isDelete) {
            this.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }

    searchUnplanned(pattern: Pattern, output: TupleReceiver) {
        for (const { slotId, relation } of this.findStored(null, pattern)) {
            output.relation(relation);
        }
        output.finish();
    }
}
