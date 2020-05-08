
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
import StorageSlotHook from './StorageSlotHook'
import Slot from './Slot'

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

export default class InMemoryStorage implements StorageSlotHook {
    graph: Graph
    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    slots: { [ slotId: string]: Relation } = {};
    nextSlotId: IDSource = new IDSource();
    byImpliedTableName: { [tn: string]: { [slotId: string]: true } } = {}

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

    hookPattern(pattern: Pattern) {
        return true;
    }

    saveNewRelation(relation: Relation, output: RelationReceiver) {

        // Save as new relation
        relation = this.resolveExpressionValues(relation);

        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }

        // Check if already slots
        for (const existing of this.findStored(relation)) {
            // Already slots
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

    *iterateSlots(pattern: Pattern): Iterable<Slot> {
        for (const { slotId, relation } of this.findStored(pattern)) {
            yield {
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
            }
        }
    }
}

