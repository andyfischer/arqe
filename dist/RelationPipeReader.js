"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationPipeReader {
    onRelation(callback) {
        if (this._onRelation)
            throw new Error('already have an onRelation callback');
        this._onRelation = callback;
    }
    onDone(callback) {
        if (this._onRelation)
            throw new Error('already have an onDone callback');
        this._onDone = callback;
    }
    waitForAll(callback) {
        const rels = [];
        this.onRelation(rel => { rels.push(rel); });
        this.onDone(() => callback(rels));
    }
}
exports.default = RelationPipeReader;
//# sourceMappingURL=RelationPipeReader.js.map