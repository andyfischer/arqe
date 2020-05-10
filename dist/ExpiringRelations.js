"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpiringRelations {
    constructor(graph) {
        this.graph = graph;
    }
    hasColumn(name) {
        return this.columns.has(name);
    }
    column(name) {
        return this.columns.get(name);
    }
    maybeInitEntityColumn(name) {
        if (!this.columns.has(name)) {
            this.columns.set(name, new ObjectSpace(name));
        }
    }
    onRelationCreated(rel) {
        if (rel.hasType('expires-at')) {
            const now = Date.now();
            const expireTime = parseInt(rel.getTagValue('expires-at'));
            setTimeout((() => {
                console.log('Deleting relation because of expires-at: ' + rel.stringify());
            }), expireTime - now);
        }
    }
    onRelationUpdated(rel) {
    }
    onRelationDeleted(rel) {
    }
}
exports.ExpiringRelations = ExpiringRelations;
//# sourceMappingURL=ExpiringRelations.js.map