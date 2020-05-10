"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function expressionUpdatesExistingValue(expr) {
    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.modifiesExisting;
}
function tagModifiesExistingRelations(tag) {
    if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr))
        return true;
    return false;
}
function modifiesExistingRelations(rel) {
    for (const tag of rel.tags)
        if (tagModifiesExistingRelations(tag))
            return true;
    return false;
}
function modificationToFilter(rel) {
    return rel.remapTags((tag) => {
        if (tag.tagType === 'deleted')
            return null;
        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue();
        else
            return tag;
    });
}
function applyModificationRelation(changeOperation, storedRel) {
    storedRel = storedRel.remapTags((tag) => {
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
function applyModificationExpr(expr, value) {
    switch (expr[0]) {
        case 'increment':
            return parseInt(value, 10) + 1 + '';
        case 'set':
            return expr[1];
    }
}
function toInitialization(rel) {
    return rel.remapTags((tag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}
function getEffects(relation) {
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
    };
}
function runSave(save) {
    const { graph, relation, output } = save;
    for (const hook of graph.saveSearchHooks) {
        if (hook.hookSave(save))
            return;
    }
    const effects = getEffects(relation);
    if (!effects.modifiesExisting) {
        graph.saveNewRelation(relation, output);
        return;
    }
    const filter = modificationToFilter(relation);
    let anyFound = false;
    const storageHook = graph.getStorageHook(filter);
    storageHook.iterateSlots(filter, {
        slot(slot) {
            anyFound = true;
            const modified = slot.modify(existing => applyModificationRelation(relation, existing));
            output.relation(modified);
            if (modified.hasType('deleted'))
                graph.onRelationDeleted(modified.removeType('deleted'));
            else
                graph.onRelationUpdated(modified);
        },
        finish() {
            if (!anyFound && effects.initializeIfMissing) {
                graph.saveNewRelation(toInitialization(relation), output);
                return;
            }
            output.finish();
        }
    });
}
exports.default = runSave;
//# sourceMappingURL=runSave.js.map