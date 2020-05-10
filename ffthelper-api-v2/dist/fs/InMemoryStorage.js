"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = require("./Pattern");
const PatternTag_1 = require("./PatternTag");
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
        delete this.relationsByNtag[rel.getNtag()];
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
    *findAllMatches(pattern) {
        for (const rel of this.linearScan(pattern)) {
            yield rel;
        }
    }
    runSearch(search) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.relation(rel);
            if (search.isDone())
                break;
        }
        search.finish();
    }
    runSave(set) {
        const command = set.command;
        const ntag = stringifyQuery_1.normalizeExactTag(command.tags);
        const existing = this.relationsByNtag[ntag];
        if (existing) {
            let modified = existing.copy();
            modified.setPayload(command.payloadStr);
            modified.freeze();
            this.relationsByNtag[ntag] = modified;
            set.saveFinished(modified);
            return;
        }
        const relationTags = command.tags.map(tag => (PatternTag_1.newTag(tag.tagType, tag.tagValue)));
        const rel = Pattern_1.commandTagsToRelation(relationTags, command.payloadStr);
        rel.freeze();
        this.relationsByNtag[ntag] = rel;
        set.saveFinished(this.relationsByNtag[ntag]);
    }
}
exports.default = InMemoryStorage;
