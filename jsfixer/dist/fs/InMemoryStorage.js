"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
const IDSource_1 = __importDefault(require("./utils/IDSource"));
class InMemoryStorage {
    constructor(graph) {
        this.nextUniqueIdPerType = {};
        this.stored = {};
        this.nextStorageId = new IDSource_1.default();
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
    *findStored(pattern) {
        for (const storageId in this.stored) {
            const relation = this.stored[storageId];
            if (pattern.matches(relation))
                yield { storageId, relation: this.stored[storageId] };
        }
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
        this.stored[this.nextStorageId.take()] = relation;
        output.relation(relation);
        this.graph.onRelationUpdated(relation);
        output.finish();
    }
    *iterateSlots(pattern) {
        for (const { storageId, relation } of this.findStored(pattern)) {
            yield {
                relation,
                modify: (func) => {
                    const modified = func(this.stored[storageId]);
                    this.stored[storageId] = modified;
                    return modified;
                },
                del: () => {
                    delete this.stored[storageId];
                }
            };
        }
    }
}
exports.default = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map