"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationBuffer {
    constructor(onDone) {
        this.items = [];
        this.onDone = onDone;
    }
    start() {
    }
    relation(rel) {
        this.items.push(rel);
    }
    finish() {
        this.onDone(this.items);
    }
    isDone() {
        return false;
    }
    error(e) {
        throw new Error('uncaught error in RelationBuffer: ' + e);
    }
}
exports.default = RelationBuffer;
//# sourceMappingURL=RelationBuffer.js.map