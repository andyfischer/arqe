
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag from './PatternTag'
import { normalizeExactTag } from './stringifyQuery'
import StorageProvider from './StorageProvider'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'
import Slot from './Slot'
import SlotReceiver from './SlotReceiver'
import CompiledQuery from './CompiledQuery'
import Database from './Database'
import QueryPlan from './QueryPlan'

type RelationModifier = (rel: Relation) => Relation

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

const exprFuncEffects = {
    increment: {
        modifiesExisting: true,
        canInitialize: false
    },
    set: {
        modifiesExisting: true,
        canInitialize: true
    }
};

function modificationToFilter(rel: Relation) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.tagType === 'deleted')
            return null;

        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue()
        else
            return tag;
    });
}

function applyModificationExpr(expr: string[], value: string) {
    switch (expr[0]) {
    case 'increment':
        return parseInt(value, 10) + 1 + '';

    case 'set':
        return expr[1];
    }
}

function expressionUpdatesExistingValue(expr: string[]) {

    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.modifiesExisting;
}

function tagModifiesExistingRelations(tag: PatternTag) {
    if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr))
        return true;

    return false;
}

function applyModification(changeOperation: Relation, storedRel: Relation): Relation {

    storedRel = storedRel.remapTags((tag: PatternTag) => {
        const modificationTag = changeOperation.getOneTagForType(tag.tagType);

        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }

        return tag;
    });

    if (changeOperation.hasType('deleted')) {
        const deletedExpr = changeOperation.getTagObject('deleted');
        if (deletedExpr && deletedExpr.valueExpr && deletedExpr.valueExpr[0] === 'set') {
            storedRel = storedRel.addNewTag('deleted');
        }
    }

    return storedRel;
}

function toInitialization(rel: Relation) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

function getEffects(relation: Relation) {

    let modifiesExisting = false;
    let canInitializeMissing = true;

    for (const tag of relation.tags) {
        const expr = tag.valueExpr;
        const tagEffects = expr && expr[0] && exprFuncEffects[expr[0]];

        if (!tagEffects)
            continue;

        if (tagEffects.modifiesExisting)
            modifiesExisting = true;

        if (tagEffects.modifiesExisting && !tagEffects.canInitialize)
            canInitializeMissing = false;
    }

    let initializeIfMissing = modifiesExisting && canInitializeMissing;

    return {
        modifiesExisting,
        initializeIfMissing
    }
}

export default class ValueDatabase {
    graph: Graph
    database: Database

    constructor(database: Database) {
        this.database = database;
        this.graph = database.graph;
    }

    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    slots: { [ slotId: string]: Relation } = {};
    nextSlotId: IDSource = new IDSource();
    byImpliedTableName: { [tn: string]: { [slotId: string]: true } } = {}

    resolveExpressionValues(rel: Relation) {
        return rel.remapTags((tag: PatternTag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniqueIdPerType[tag.tagType])
                    this.nextUniqueIdPerType[tag.tagType] = new IDSource();

                return tag.setValue(this.nextUniqueIdPerType[tag.tagType].take());
            }

            if (tag.valueExpr && tag.valueExpr[0] === 'seconds-from-now') {
                const seconds = parseInt(tag.valueExpr[1]);
                return tag.setValue(Date.now() + (seconds * 1000) + '');
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
                emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
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

        const effects = getEffects(pattern);
        const changeOperation = pattern;
        const filter = modificationToFilter(pattern);
        let hasFoundAny = false;

        for (const { slotId, relation } of this.findStored(filter)) {

            const modified = applyModification(changeOperation, this.slots[slotId]);

            if (modified.hasType('deleted')) {
                delete this.slots[slotId];
                const itn = getImpliedTableName(relation);
                delete (this.byImpliedTableName[itn] || {})[slotId];
                graph.onRelationDeleted(modified.removeType('deleted'));
            } else {
                this.slots[slotId] = modified;
                graph.onRelationUpdated(modified);
            }

            output.relation(modified);
            hasFoundAny = true;
        }

        if (!hasFoundAny && effects.initializeIfMissing) {
            this.database.insert({ relation: toInitialization(pattern), output });
            return;
        }

        output.finish();
    }

    resolveUniqueTag(tag: PatternTag) {
        if (!this.nextUniqueIdPerType[tag.tagType])
            this.nextUniqueIdPerType[tag.tagType] = new IDSource();

        return tag.setValue(this.nextUniqueIdPerType[tag.tagType].take());
    }

    saveNewRelation2(relation: Relation, output: RelationReceiver) {

        // Check if already saved.
        for (const existing of this.findStored(relation)) {
            // Already saved.
            return;
        }

        // Store a new relation
        const slotId = this.nextSlotId.take();
        this.slots[slotId] = relation;

        const itn = getImpliedTableName(relation);
        this.byImpliedTableName[itn] = this.byImpliedTableName[itn] || {};
        this.byImpliedTableName[itn][slotId] = true;
    }

    getRelations(pattern: Pattern, output: RelationReceiver) {
        for (const { relation } of this.findStored(pattern)) {
            output.relation(relation);
        }
    }

    select(plan: QueryPlan) {
        const { pattern, output } = plan;

        for (const { slotId, relation } of this.findStored(pattern)) {
            output.relation(relation);
        }

        output.finish();
    }

    /*
    iterateSlots(pattern: Pattern, output: SlotReceiver) {
        for (const { slotId, relation } of this.findStored(pattern)) {
            output.slot({
                relation,
                modify: (func: (rel: Pattern) => Pattern) => {
                    const modified = func(this.slots[slotId]);

                    if (modified.hasType('deleted')) {
                        delete this.slots[slotId];
                        const itn = getImpliedTableName(relation);
                        delete (this.byImpliedTableName[itn] || {})[slotId];
                    } else {
                        this.slots[slotId] = modified;
                    }

                    return modified;
                }
            });
        }

        output.finish();
    }
    */

}
