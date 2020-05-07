
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'

const exprFuncEffects = {
    increment: {
        modifiesExisting: true,
        initializeIfMissing: false
    },
    set: {
        modifiesExisting: true,
        canInitialize: true
    }
};

interface RelationEffects {
    modifiesExisting: boolean
    initializeIfMissing: boolean
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

export default function runSave(graph: Graph, relation: Relation, output: RelationReceiver) {
    for (const hook of graph.saveSearchHooks) {
        if (hook.hookSave(graph, relation, output))
            return;
    }

    const effects = getEffects(relation);

    if (!effects.modifiesExisting) {
        graph.inMemory.saveNewRelation(relation, output);
        return;
    }

    const filter = modificationToFilter(relation);
    let anyFound = false;

    for (const slot of graph.inMemory.iterateSlots(filter)) {

        anyFound = true;

        const modified = slot.modify(existing =>
            applyModificationRelation(relation, existing)
        );

        output.relation(modified);
        graph.onRelationUpdated(modified);
    }

    if (!anyFound && effects.initializeIfMissing) {
        graph.inMemory.saveNewRelation(toInitialization(relation), output);
        return;
    }

    output.finish();
    return;
}

