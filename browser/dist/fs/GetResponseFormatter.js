"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class GetResponseFormatter {
    constructor() {
        // Progress
        this.anyResults = false;
        // Protocol validation
        this.hasStarted = false;
        this.hasFinished = false;
    }
    start() {
        if (this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .start() called twice");
        if (this.asMultiResults && !this.skipStartAndDone)
            this.respond('#start');
        this.hasStarted = true;
    }
    formatRelation(rel) {
        const outTags = [];
        for (const tag of rel.eachTag()) {
            if (this.pattern.fixedTagsForType[tag.tagType])
                continue;
            outTags.push(stringifyQuery_1.commandTagToString(tag));
        }
        let str = outTags.join(' ');
        if (!this.listOnly) {
            str += (rel.hasPayload() ? ` == ${rel.payload()}` : '');
        }
        if (this.asSetCommands)
            str = 'set ' + str;
        return str;
    }
    relation(rel) {
        if (!this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .relation called before .start()");
        if (this.hasFinished)
            throw new Error("ResponseFormatter protocol error: .relation called after .finish()");
        const { respond, pattern, extendedResult, asMultiResults } = this;
        this.anyResults = true;
        if (asMultiResults) {
            if (extendedResult) {
                respond(this.schema.stringifyRelation(rel));
            }
            else {
                respond(this.formatRelation(rel));
            }
        }
        else {
            if (extendedResult) {
                respond(this.schema.stringifyRelation(rel));
            }
            else {
                if (rel.hasPayload()) {
                    respond(rel.payload());
                }
                else {
                    respond('#exists');
                }
            }
        }
    }
    finish() {
        if (!this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .finish() called before .start()");
        if (this.hasFinished)
            throw new Error("ResponseFormatter protocol error: .finish() called twice");
        this.hasFinished = true;
        if (!this.skipStartAndDone) {
            if (this.asMultiResults)
                this.respond('#done');
            if (!this.asMultiResults && !this.anyResults)
                this.respond('#null');
        }
    }
}
exports.default = GetResponseFormatter;
