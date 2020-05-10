"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookObjectSpace_1 = require("./hookObjectSpace");
function expressionUpdatesExistingValue(expr) {
    if (!expr)
        return false;
    if (expr[0] === 'increment' || expr[0] === 'set')
        return true;
    return false;
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
        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue();
        else
            return tag;
    });
}
function applyModificationRelation(changeOperation, storedRel) {
    return storedRel.remapTags((tag) => {
        const modificationTag = changeOperation.getOneTagForType(tag.tagType);
        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }
        return tag;
    });
}
function applyModificationExpr(expr, value) {
    switch (expr[0]) {
        case 'increment':
            return parseInt(value, 10) + 1 + '';
        case 'set':
            return expr[1];
    }
}
function runSet(graph, relation, output) {
    if (hookObjectSpace_1.hookObjectSpaceSave(graph, relation, output))
        return;
    if (modifiesExistingRelations(relation)) {
        const filter = modificationToFilter(relation);
        for (const slot of graph.inMemory.iterateSlots(filter)) {
            const modified = slot.modify(existing => applyModificationRelation(relation, existing));
            output.relation(modified);
            graph.onRelationUpdated(modified);
        }
        output.finish();
        return;
    }
    else {
        graph.inMemory.saveNewRelation(relation, output);
    }
}
exports.default = runSet;
//# sourceMappingURL=runSet.js.map