
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
import { emitActionPerformed } from './CommandMeta'
import { newTagFromObject } from './PatternTag'

type RelationModifier = (rel: Relation) => Relation

function expressionUpdatesExistingValue(expr: string[]) {
    if (!expr)
        return false;

    if (expr[0] === 'increment' || expr[0] === 'set')
        return true;

    return false;
}

function applyModificationExpr(expr: string[], value: string) {
    switch (expr[0]) {
    case 'increment':
        return parseInt(value, 10) + 1 + '';

    case 'set':
        return expr[1];
    }
}

function applyModificationRelation(commandRel: Relation, data: Relation): Relation {
    return data.remapTags((tag: PatternTag) => {
        const modificationTag = commandRel.getOneTagForType(tag.tagType);
        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }

        return tag;
    });
}

function tagModifiesExistingRelations(tag: PatternTag) {
    if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr))
        return true;

    return false;
}

function modifiesExistingRelations(rel: Relation) {
    for (const tag of rel.tags)
        if (tagModifiesExistingRelations(tag))
            return true
    return false
}

function modificationToFilter(rel: Relation) {
    return rel.remapTags((tag: PatternTag) => {
        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue()
        else
            return tag;
    });
}

export default class InMemoryStorage implements StorageProvider {
    graph: Graph
    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};
    stored: { [ storageId: string]: Relation } = {};
    nextStorageId: IDSource = new IDSource();

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

    *findStored(pattern: Pattern): Iterable<{storageId:string, relation: Relation}> {

        // Full scan
        for (const storageId in this.stored) {
            const relation = this.stored[storageId];
            if (pattern.matches(relation))
                yield { storageId, relation: this.stored[storageId] }
        }
    }

    runSearch(search: RelationSearch) {
        for (const { storageId, relation } of this.findStored(search.pattern)) {
            search.relation(relation);
        }

        search.finish();
    }

    runModification(commandRel: Relation, output: RelationReceiver) {
        const filter = modificationToFilter(commandRel);

        const changes: { storageId: string, modified: Relation}[] = [];

        for (const { storageId, relation } of this.findStored(filter)) {
            const modified = applyModificationRelation(commandRel, relation);
            changes.push({storageId, modified});
        }

        for (const change of changes) {
            this.stored[change.storageId] = change.modified;
            output.relation(change.modified);
            this.graph.onRelationUpdated(change.modified);
        }

        output.finish();
    }

    runSave(relation: Relation, output: RelationReceiver) {
        if (modifiesExistingRelations(relation)) {
            this.runModification(relation, output);
            return;
        }

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
        this.stored[this.nextStorageId.take()] = relation;
        output.relation(relation);
        this.graph.onRelationUpdated(relation);
        output.finish();
    }

    runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver) {

        for (const { storageId, relation } of this.findStored(pattern)) {
            delete this.stored[storageId];
            graph.onRelationDeleted(relation);
        }

        emitActionPerformed(output);
        output.finish();
    }
}

