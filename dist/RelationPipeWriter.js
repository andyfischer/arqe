"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationPipeWriter {
    assertReady() {
        if (!this._downstream)
            throw new Error('no downstream reader connected');
        if (!this._downstream._onRelation)
            throw new Error('downstream does not have an onRelation callback');
        if (!this._downstream._onDone)
            throw new Error('downstream does not have an onDone callback');
    }
    connectToReader(reader) {
        if (this._downstream)
            throw new Error('already have reader connected');
        this._downstream = reader;
    }
    relation(rel) {
        this.assertReady();
        this._downstream._onRelation(rel);
    }
    isDone() {
        return false;
    }
    finish() {
        this.assertReady();
        if (this._downstream._onDone)
            this._downstream._onDone();
    }
}
exports.default = RelationPipeWriter;
//# sourceMappingURL=RelationPipeWriter.js.map