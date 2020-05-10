"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
const CommandMeta_2 = require("./CommandMeta");
function expressionUpdatesExistingValue(expr) {
    if (!expr)
        return false;
    if (expr[0] === 'increment' || expr[0] === 'set')
        return true;
    return false;
}
function applyModificationExpr(expr, value) {
    switch (expr[0]) {
        case 'increment':
            return parseInt(value, 10) + 1 + '';
        case 'set':
            return expr[1];
    }
}
function applyModificationRelation(commandRel, data) {
    return data.remapTags((tag) => {
        const modificationTag = commandRel.getOneTagForType(tag.tagType);
        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }
        return tag;
    });
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
class InMemoryStorage {
    constructor(graph) {
        this.relationsByNtag = {};
        this.nextUniqueIdPerType = {};
        this.graph = graph;
    }
    *linearScan(pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }
    *findAllMatches(pattern) {
        for (const rel of this.linearScan(pattern)) {
            yield rel;
        }
    }
    runSearch(search) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.relation(rel);
        }
        search.finish();
    }
    runModification(commandRel, output) {
        const filter = modificationToFilter(commandRel);
        for (const ntag in this.relationsByNtag) {
            const scanRel = this.relationsByNtag[ntag];
            if (filter.isSupersetOf(scanRel)) {
                delete this.relationsByNtag[ntag];
                const modified = applyModificationRelation(commandRel, scanRel);
                this.runSave(modified, output);
            }
        }
        output.finish();
    }
    saveOne(relation, output) {
        const ntag = relation.getNtag();
        this.relationsByNtag[ntag] = relation;
        output.relation(relation);
        this.graph.onRelationUpdatedV3(relation);
    }
    runSave(relation, output) {
        if (modifiesExistingRelations(relation)) {
            this.runModification(relation, output);
            return;
        }
        const ntag = relation.getNtag();
        const existing = this.relationsByNtag[ntag];
        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                CommandMeta_1.emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
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
        this.graph.onRelationCreated(relation);
    }
    deleteRelation(rel) {
        delete this.relationsByNtag[rel.getNtag()];
    }
    runDelete(graph, pattern, output) {
        for (const rel of graph.inMemory.findAllMatches(pattern)) {
            if (rel.hasType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");
            graph.inMemory.deleteRelation(rel);
            graph.onRelationDeleted(rel);
        }
        CommandMeta_2.emitActionPerformed(output);
        output.finish();
    }
}
exports.default = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map