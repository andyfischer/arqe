
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'
import Database from './Database'
import QueryPlan from './QueryPlan'

interface Slot {
    relation: Relation
}

function getImpliedTableName(rel: Relation) {
    for (const tag of rel.tags)
        if (tag.star || tag.doubleStar)
            return null;
    
    const els = rel.tags
        .filter(r => r.tagType !== 'deleted')
        .map(r => r.tagType);

    els.sort();
    return els.join(' ');
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
    database: Database

    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    slots: { [ slotId: string]: Relation } = {};
    nextSlotId: IDSource = new IDSource();
    byImpliedTableName: { [tn: string]: { [slotId: string]: true } } = {}

    constructor(database: Database) {
        this.database = database;
        this.graph = database.graph;
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

    *findStored(search: Pattern): Iterable<{slotId:string, relation: Relation}> {

        const itn = getImpliedTableName(search);
        if (itn) {
            const indexedStorageIds = this.byImpliedTableName[itn] || {};

            for (const slotId in indexedStorageIds) {
                const relation = this.slots[slotId];
                if (search.matches(relation))
                    yield { slotId, relation }
            }
            
            return;
        }

        // Full scan
        for (const slotId in this.slots) {
            const relation = this.slots[slotId];
            if (search.matches(relation))
                yield { slotId, relation }
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

        // Check if already saved.
        for (const existing of this.findStored(relation)) {
            // Already saved.
            output.relation(relation);
            output.finish();
            return;
        }

        // Store a new relation
        const slotId = this.nextSlotId.take();
        this.slots[slotId] = relation;
        output.relation(relation);

        const itn = getImpliedTableName(relation);
        this.byImpliedTableName[itn] = this.byImpliedTableName[itn] || {};
        this.byImpliedTableName[itn][slotId] = true;
        this.graph.onRelationUpdated(relation);
        output.finish();
    }

    update(plan: QueryPlan) {
        const { pattern, output } = plan;
        const graph = this.graph;

        const changeOperation = pattern;
        let hasFoundAny = false;

        for (const { slotId, relation } of this.findStored(plan.filterPattern)) {

            const modified = plan.modificationCallback(relation);
            this.slots[slotId] = modified;
            graph.onRelationUpdated(modified);
            output.relation(modified);
            hasFoundAny = true;
        }

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

        for (const { slotId, relation } of this.findStored(plan.filterPattern)) {
            delete this.slots[slotId];
            const itn = getImpliedTableName(relation);
            delete (this.byImpliedTableName[itn] || {})[slotId];
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

        for (const { slotId, relation } of this.findStored(pattern)) {
            output.relation(relation);
        }

        output.finish();
    }
}
