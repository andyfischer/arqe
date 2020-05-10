"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetRespondRelations {
    constructor() {
        this.relations = [];
    }
    start() {
    }
    relation(rel) {
        this.relations.push(rel);
    }
    finish() {
        this.finished = true;
    }
}
exports.default = GetRespondRelations;
//# sourceMappingURL=GetRespondRelations.js.map