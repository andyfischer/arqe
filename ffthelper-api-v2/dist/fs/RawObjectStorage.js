"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = require("./Pattern");
const stringifyQuery_1 = require("./stringifyQuery");
const PatternTag_1 = require("./PatternTag");
class RawObjectStorage {
    constructor(pattern) {
        this.value = {};
        this.linkedPattern = pattern;
        if (pattern.starValueTags.length !== 1) {
            throw new Error("RawObjectStorage expected to link with a single star value pattern, saw: "
                + stringifyQuery_1.commandTagsToString(pattern.tags));
        }
        this.variedType = pattern.starValueTags[0].tagType;
    }
    *findAllMatches(pattern) {
        const variedTag = pattern.getOneTagForType(this.variedType);
        const otherTags = pattern.tags.filter(tag => tag.tagType !== variedTag.tagType);
        if (variedTag.starValue) {
            for (const key in this.value) {
                yield Pattern_1.commandTagsToRelation(otherTags.concat(PatternTag_1.newTag(variedTag.tagType, key)), this.value[key]);
            }
        }
        else {
            const key = variedTag.tagValue;
            if (this.value[key] !== undefined) {
                yield Pattern_1.commandTagsToRelation(otherTags.concat(PatternTag_1.newTag(variedTag.tagType, key)), this.value[key]);
            }
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
        set.saveFinished(Pattern_1.commandTagsToRelation([], ''));
    }
}
exports.default = RawObjectStorage;
