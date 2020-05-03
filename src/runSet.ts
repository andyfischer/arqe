
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { hookObjectSpaceSearch, hookObjectSpaceSave } from './hookObjectSpace'

function expressionUpdatesExistingValue(expr: string[]) {
    if (!expr)
        return false;

    if (expr[0] === 'increment' || expr[0] === 'set')
        return true;

    return false;
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

function applyModificationRelation(changeOperation: Relation, storedRel: Relation): Relation {
    return storedRel.remapTags((tag: PatternTag) => {
        const modificationTag = changeOperation.getOneTagForType(tag.tagType);
        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }

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

export default function runSet(graph: Graph, relation: Relation, output: RelationReceiver) {
    if (hookObjectSpaceSave(graph, relation, output))
        return;

    if (modifiesExistingRelations(relation)) {
        const filter = modificationToFilter(relation);

        for (const slot of graph.inMemory.iterateSlots(filter)) {

            const modified = slot.modify(existing =>
                applyModificationRelation(relation, existing)
            );

            output.relation(modified);
            graph.onRelationUpdated(modified);
        }

        output.finish();
        return;

    } else {
        graph.inMemory.saveNewRelation(relation, output);
    }
}

