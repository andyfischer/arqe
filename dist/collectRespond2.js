"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collectRespond2(onDone) {
    const saw = [];
    return {
        start() { },
        relation: (rel) => {
            saw.push(rel.stringifyRelation());
        },
        isDone() { return false; },
        finish: () => {
            onDone(saw);
        }
    };
}
exports.default = collectRespond2;
//# sourceMappingURL=collectRespond2.js.map