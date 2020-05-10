"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function receiveToRelationStream(onRel, onDone) {
    return {
        relation: onRel,
        finish: onDone
    };
}
exports.receiveToRelationStream = receiveToRelationStream;
function receiveToNull() {
    return {
        relation(rel) { },
        finish() { }
    };
}
exports.receiveToNull = receiveToNull;
//# sourceMappingURL=RelationReceiver.js.map