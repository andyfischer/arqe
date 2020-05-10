"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class GetResponseFormatter {
    constructor(graph) {
        this.anyResults = false;
        this.enoughResults = false;
        this.hasStarted = false;
        this.calledFinish = false;
        this.graph = graph;
    }
    start() {
        if (this.hasStarted)
            return;
        if (this.asMultiResults)
            this.respond('#start');
        this.hasStarted = true;
    }
    formatRelation(rel) {
        if (rel.hasType('command-meta') && rel.hasType('error'))
            return '#error ' + rel.getValue();
        const tags = rel.tags.filter(tag => {
            if (!this.extendedResult && this.pattern.fixedTagsForType[tag.tagType])
                return false;
            return true;
        });
        this.graph.ordering.sortTags(tags);
        const tagStrs = tags.map(stringifyQuery_1.commandTagToString);
        let str = tagStrs.join(' ');
        if (!this.listOnly) {
            str += (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');
        }
        if (rel.wasDeleted) {
            str = 'delete ' + str;
        }
        else if (this.asSetCommands || this.extendedResult) {
            str = 'set ' + str;
        }
        return str;
    }
    relation(rel) {
        if (!this.hasStarted)
            this.start();
        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .relation called after .finish()");
        if (this.enoughResults)
            return;
        if (rel.hasType('command-meta') && !rel.hasType('error')) {
            console.log('warning, dropping meta: ', rel.stringifyRelation());
            return;
        }
        const { respond, pattern, extendedResult, asMultiResults } = this;
        this.anyResults = true;
        if (asMultiResults) {
            respond(this.formatRelation(rel));
        }
        else {
            if (extendedResult) {
                respond(this.formatRelation(rel));
            }
            else {
                if (rel.hasPayload()) {
                    respond(rel.getPayload());
                }
                else {
                    respond('#exists');
                }
            }
            this.enoughResults = true;
        }
    }
    error(e) {
        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .error() called after .finish");
        this.respond('#error ' + e);
    }
    finish() {
        if (!this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .finish() called before .start()");
        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .finish() called twice");
        if (this.enoughResults)
            return;
        this.calledFinish = true;
        if (this.asMultiResults)
            this.respond('#done');
        if (!this.asMultiResults && !this.anyResults)
            this.respond('#null');
    }
    isDone() {
        return this.calledFinish || this.enoughResults;
    }
}
exports.default = GetResponseFormatter;
//# sourceMappingURL=GetResponseFormatter.js.map