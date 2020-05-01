
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

    relationsByNtag: { [ ntag: string]: Relation } = {};
    nextUniqueIdPerType: { [ typeName: string]: IDSource } = {};

    stored: { [ storageId: string]: Relation } = {}

    storageId: IDSource = new IDSource()

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

    *linearScan(pattern: Pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
 
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }

    *findAllMatches(pattern: Pattern) {
        for (const rel of this.linearScan(pattern)) {
            yield rel;
        }
    }

    runSearch(search: RelationSearch) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.relation(rel);
        }

        search.finish();
    }

    runModification(commandRel: Relation, output: RelationReceiver) {
        const filter = modificationToFilter(commandRel);

        for (const ntag in this.relationsByNtag) {
            const scanRel = this.relationsByNtag[ntag];

            if (filter.isSupersetOf(scanRel)) {
                delete this.relationsByNtag[ntag];

                const modified = applyModificationRelation(commandRel, scanRel);
                this.saveOne(modified, output);
            }
        }

        output.finish();
    }

    saveOne(relation: Relation, output: RelationReceiver) {
        const ntag = relation.getNtag();
        this.relationsByNtag[ntag] = relation;
        output.relation(relation);
        this.graph.onRelationUpdated(relation);
    }

    runSave(relation: Relation, output: RelationReceiver) {
        if (modifiesExistingRelations(relation)) {
            this.runModification(relation, output);
            return;
        }

        // Save as new relation
        relation = this.resolveExpressionValues(relation);
        const ntag = relation.getNtag();
        const existing = this.relationsByNtag[ntag];

        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }

        if (existing) {
            let modified = existing.setPayload(relation.getPayload());
            this.saveOne(modified, output);
            output.finish();
            return;
        }
        
        this.saveOne(relation, output);
        output.finish();
    }

    deleteRelation(rel: Relation) {
        delete this.relationsByNtag[rel.getNtag()];
    }

    runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver) {
        for (const rel of graph.inMemory.findAllMatches(pattern)) {
            if (rel.hasType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            graph.inMemory.deleteRelation(rel);
            graph.onRelationDeleted(rel);
        }

        emitActionPerformed(output);
        output.finish();
    }
}

