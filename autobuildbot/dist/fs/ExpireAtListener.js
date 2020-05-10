"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpireAtListener {
    constructor(graph) {
        this.graph = graph;
    }
    onRelationUpdated(rel) {
        if (rel.hasType('expires-at')) {
            const now = Date.now();
            const expireTime = parseInt(rel.getTagValue('expires-at'));
            const delay = expireTime - now;
            setTimeout((() => {
                console.log('Deleting relation because of expires-at: ' + rel.stringify());
                this.graph.run('delete ' + rel.stringify());
            }), delay);
        }
    }
    onRelationDeleted(rel) {
    }
}
exports.default = ExpireAtListener;
//# sourceMappingURL=ExpireAtListener.js.map