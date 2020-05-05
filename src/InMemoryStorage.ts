
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag from './PatternTag'
import { normalizeExactTag } from './stringifyQuery'
import StorageProvider from './StorageProvider'
import RelationSearch from './RelationSearch'
import RelationReceiver from './RelationReceiver'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'

type RelationModifier = (rel: Relation) => Relation

interface Slot {
    relation: Pattern
    modify: (f: (rel: Pattern) => Pattern) => Pattern
    del: () => void
}

function getImpliedTableName(rel: Relation) {
    for (const tag of rel.tags)
        if (tag.star || tag.doubleStar)
            return null;
    
    const els = rel.tags.map(r => r.tagType);
    return els.join('-');
}

export default class InMemoryStorage {
    graph: Graph
    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    stored: { [ storageId: string]: Relation } = {};
    nextStorageId: IDSource = new IDSource();
    byImpliedTableName: { [tn: string]: { [storageId: string]: true } } = {}

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

    *findStored(search: Pattern): Iterable<{storageId:string, relation: Relation}> {

        const itn = getImpliedTableName(search);
        if (itn) {
            const indexedStorageIds = this.byImpliedTableName[itn] || [];
            for (const storageId in indexedStorageIds) {
                const stored = this.stored[storageId];
                const relation = this.stored[storageId];
                if (search.matches(relation))
                    yield { storageId, relation: this.stored[storageId] }
            }
            
            return;
        }

        // Full scan
        for (const storageId in this.stored) {
            const relation = this.stored[storageId];
            if (search.matches(relation))
                yield { storageId, relation: this.stored[storageId] }
        }
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

        // Check if already stored
        for (const existing of this.findStored(relation)) {
            // Already stored
            output.relation(relation);
            output.finish();
            return;
        }

        // Store a new relation
        const storageId = this.nextStorageId.take();
        this.stored[storageId] = relation;
        output.relation(relation);

        const itn = getImpliedTableName(relation);
        this.byImpliedTableName[itn] = this.byImpliedTableName[itn] || {};
        this.byImpliedTableName[itn][storageId] = true;
        this.graph.onRelationUpdated(relation);
        output.finish();
    }

    *iterateSlots(pattern: Pattern): Iterable<Slot> {
        for (const { storageId, relation } of this.findStored(pattern)) {
            yield {
                relation,
                modify: (func: (rel: Pattern) => Pattern) => {
                    const modified = func(this.stored[storageId]);
                    this.stored[storageId] = modified;
                    return modified;
                },
                del: () => {
                    delete this.stored[storageId];
                    const itn = getImpliedTableName(relation);
                    delete (this.byImpliedTableName[itn] || {})[storageId];
                }
            }
        }
    }
}

