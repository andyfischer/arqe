"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetResponseFormatterExists {
    constructor(respond) {
        this.count = 0;
        this.respond = respond;
    }
    start() {
    }
    relation(rel) {
        this.count += 1;
    }
    deleteRelation() { }
    error(e) {
        this.respond('#error ' + e);
    }
    finish() {
        this.respond('' + this.count);
    }
    isDone() {
        return false;
    }
}
exports.default = GetResponseFormatterExists;
//# sourceMappingURL=GetResponseFormatterCount.js.map