
import Relation from './Relation'
import Pattern from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'
import QueryPlan, { QueryTag } from './QueryPlan'

interface Slot {
    relation: Relation
}

function toInitialization(rel: Relation) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

export default class TupleStore {
    graph: Graph

    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    slots: { [ slotId: string]: Relation } = {};
    nextSlotId: IDSource = new IDSource();
    byTableName: { [tn: string]: { [slotId: string]: true } } = {}

    constructor(graph: Graph) {
        this.graph = graph;
    }

    resolveExpressionValues(rel: Relation) {
        return rel.remapTags((tag: PatternTag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniqueIdPerType[tag.tagType])
                    this.nextUniqueIdPerType[tag.tagType] = new IDSource();

                return tag.setValue(this.nextUniqueIdPerType[tag.tagType].take());
            }

            return tag;
        });
    }

    *findStored(tableName: string, search: Pattern): Iterable<{slotId:string, relation: Relation, tableName: string}> {

        if (tableName) {
            const indexedStorageIds = this.byTableName[tableName] || {};

            for (const slotId in indexedStorageIds) {
                const relation = this.slots[slotId];
                if (search.matches(relation))
                    yield { slotId, relation, tableName }
            }
            
            return;
        }

        // Full scan
        for (const slotId in this.slots) {
            const relation = this.slots[slotId];
            if (search.matches(relation))
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
        this.graph.onRelationUpdated(relation);
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
            graph.onRelationUpdated(modified);
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
            graph.onRelationDeleted(relation);
            output.relation(relation.addTagObj(newTag('deleted')));
        }

        output.finish();
    }

    resolveUniqueTag(tag: PatternTag) {
        if (!this.nextUniqueIdPerType[tag.tagType])
            this.nextUniqueIdPerType[tag.tagType] = new IDSource();

        return tag.setValue(this.nextUniqueIdPerType[tag.tagType].take());
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

    searchUnplanned(pattern: Pattern, output: RelationReceiver) {
        for (const { slotId, relation } of this.findStored(null, pattern)) {
            output.relation(relation);
        }
        output.finish();
    }
}
