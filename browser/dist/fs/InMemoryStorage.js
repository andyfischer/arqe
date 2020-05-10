"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relation_1 = __importDefault(require("./Relation"));
const stringifyQuery_1 = require("./stringifyQuery");
class InMemoryStorage {
    constructor() {
        this.relationsByNtag = {};
    }
    *everyRelation() {
        for (const ntag in this.relationsByNtag) {
            yield this.relationsByNtag[ntag];
        }
    }
    deleteRelation(rel) {
        delete this.relationsByNtag[rel.ntag];
    }
    *linearScan(pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }
    findExactMatch(pattern) {
        // Exact tag lookup.
        const ntag = stringifyQuery_1.normalizeExactTag(pattern.tags);
        return this.relationsByNtag[ntag];
    }
    findOneMatch(pattern) {
        const found = this.findExactMatch(pattern);
        if (found)
            return found;
    }
    *findAllMatches(pattern) {
        if (pattern.isMultiMatch()) {
            for (const rel of this.linearScan(pattern)) {
                yield rel;
            }
        }
        else {
            const one = this.findOneMatch(pattern);
            if (one)
                yield one;
        }
    }
    runSearch(search) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.foundRelation(rel);
            if (search.done)
                break;
        }
        search.finishSearch();
    }
    runSave(set) {
        const command = set.command;
        const ntag = stringifyQuery_1.normalizeExactTag(command.tags);
        const existing = this.relationsByNtag[ntag];
        if (existing) {
            existing.setPayload(command.payloadStr);
            set.saveFinished(existing);
            return;
        }
        const relationTags = command.tags.map(tag => ({
            tagType: tag.tagType,
            tagValue: tag.tagValue
        }));
        this.relationsByNtag[ntag] = new Relation_1.default(ntag, relationTags, command.payloadStr);
        set.saveFinished(this.relationsByNtag[ntag]);
    }
}
exports.default = InMemoryStorage;
