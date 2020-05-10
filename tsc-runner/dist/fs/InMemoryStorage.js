"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = require("./RelationPattern");
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
            existing.setPayload(command.payloadStr);
            set.saveFinished(existing);
            return;
        }
        const relationTags = command.tags.map(tag => ({
            tagType: tag.tagType,
            tagValue: tag.tagValue
        }));
        this.relationsByNtag[ntag] = RelationPattern_1.commandTagsToRelation(relationTags, command.payloadStr);
        set.saveFinished(this.relationsByNtag[ntag]);
    }
}
exports.default = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map