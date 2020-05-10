"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
const IDSource_1 = __importDefault(require("./utils/IDSource"));
function getImpliedTableName(rel) {
    for (const tag of rel.tags)
        if (tag.star || tag.doubleStar)
            return null;
    const els = rel.tags
        .filter(r => r.tagType !== 'deleted')
        .map(r => r.tagType);
    els.sort();
    return els.join(' ');
}
class InMemoryStorage {
    constructor(graph) {
        this.nextUniqueIdPerType = {};
        this.slots = {};
        this.nextSlotId = new IDSource_1.default();
        this.byImpliedTableName = {};
        this.graph = graph;
    }
    resolveExpressionValues(rel) {
        return rel.remapTags((tag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniqueIdPerType[tag.tagType])
                    this.nextUniqueIdPerType[tag.tagType] = new IDSource_1.default();
                return tag.setValue(this.nextUniqueIdPerType[tag.tagType].take());
            }
            if (tag.valueExpr && tag.valueExpr[0] === 'seconds-from-now') {
                const seconds = parseInt(tag.valueExpr[1]);
                return tag.setValue(Date.now() + (seconds * 1000) + '');
            }
            return tag;
        });
    }
    *findStored(search) {
        const itn = getImpliedTableName(search);
        if (itn) {
            const indexedStorageIds = this.byImpliedTableName[itn] || {};
            for (const slotId in indexedStorageIds) {
                const relation = this.slots[slotId];
                if (search.matches(relation))
                    yield { slotId, relation };
            }
            return;
        }
        for (const slotId in this.slots) {
            const relation = this.slots[slotId];
            if (search.matches(relation))
                yield { slotId, relation };
        }
    }
    hookPattern(pattern) {
        return true;
    }
    saveNewRelation(relation, output) {
        relation = this.resolveExpressionValues(relation);
        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                CommandMeta_1.emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }
        for (const existing of this.findStored(relation)) {
            output.relation(relation);
            output.finish();
            return;
        }
        const slotId = this.nextSlotId.take();
        this.slots[slotId] = relation;
        output.relation(relation);
        const itn = getImpliedTableName(relation);
        this.byImpliedTableName[itn] = this.byImpliedTableName[itn] || {};
        this.byImpliedTableName[itn][slotId] = true;
        this.graph.onRelationUpdated(relation);
        output.finish();
    }
    iterateSlots(pattern, output) {
        for (const { slotId, relation } of this.findStored(pattern)) {
            output.slot({
                relation,
                modify: (func) => {
                    const modified = func(this.slots[slotId]);
                    if (modified.hasType('deleted')) {
                        delete this.slots[slotId];
                        const itn = getImpliedTableName(relation);
                        delete (this.byImpliedTableName[itn] || {})[slotId];
                    }
                    else {
                        this.slots[slotId] = modified;
                    }
                    return modified;
                }
            });
        }
        output.finish();
    }
}
exports.default = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map