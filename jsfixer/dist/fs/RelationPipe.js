"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationPipe {
    constructor() {
        this._backlog = [];
    }
    relation(rel) {
        if (this._onRelation)
            this._onRelation(rel);
        else
            this._backlog.push(rel);
    }
    isDone() {
        return false;
    }
    finish() {
        if (this._onDone)
            this._onDone();
        else
            this._wasClosed = true;
    }
    onRelation(callback) {
        if (this._onRelation)
            throw new Error('already have an onRelation callback');
        this._onRelation = callback;
        for (const r of this._backlog)
            this._onRelation(r);
    }
    onDone(callback) {
        if (this._onDone)
            throw new Error('already have an onDone callback');
        this._onDone = callback;
        if (this._wasClosed)
            this._onDone();
    }
    waitForAll(callback) {
        const rels = [];
        this.onRelation(rel => { rels.push(rel); });
        this.onDone(() => callback(rels));
    }
    pipeToReceiver(receiver) {
        this.onRelation(rel => receiver.relation(rel));
        this.onDone(() => receiver.finish());
    }
}
exports.default = RelationPipe;
//# sourceMappingURL=RelationPipe.js.map