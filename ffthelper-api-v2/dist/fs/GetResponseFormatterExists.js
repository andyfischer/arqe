"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetResponseFormatterExists {
    constructor(respond) {
        this.hasReplied = false;
        this.respond = respond;
    }
    start() { }
    relation(rel) {
        if (this.hasReplied)
            return;
        this.respond('#exists');
        this.hasReplied = true;
    }
    deleteRelation() { }
    error(e) {
        this.respond('#error ' + e);
    }
    isDone() {
        return this.hasReplied;
    }
    finish() {
        if (!this.hasReplied)
            this.respond('#null');
    }
}
exports.default = GetResponseFormatterExists;
