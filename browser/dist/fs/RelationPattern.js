"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relation_1 = __importDefault(require("./Relation"));
const parseCommand_1 = __importDefault(require("./parseCommand"));
const stringifyQuery_1 = require("./stringifyQuery");
class RelationPattern {
    constructor(tags) {
        this.tags = [];
        this.starValueTags = [];
        this.fixedTags = [];
        this.fixedTagsForType = {};
        this.tagsForType = {};
        this.tags = tags;
        this.tagCount = tags.length;
        for (const tag of tags) {
            const { tagType } = tag;
            if (!this.tagsForType[tagType])
                this.tagsForType[tagType] = [];
            this.tagsForType[tagType].push(tag);
            if (tag.star) {
                // this.hasStarTag = true
            }
            else if (tag.doubleStar) {
                this.hasDoubleStar = true;
            }
            else if (tag.star) {
                this.hasStar = true;
            }
            else if (tag.starValue) {
                this.starValueTags.push(tag);
            }
            else {
                this.fixedTags.push(tag);
                this.fixedTagsForType[tag.tagType] = true;
            }
        }
    }
    isSupersetOf(subPattern) {
        if (this.hasDoubleStar)
            return true;
        if (this.tagCount !== subPattern.tagCount)
            return false;
        for (const tag of this.tags) {
            let foundMatch = false;
            if (tag.star)
                continue;
            for (const subTag of (subPattern.tagsForType[tag.tagType] || [])) {
                if (!subTag)
                    return false;
                if (tag.starValue)
                    foundMatch = true;
                else if (subTag.starValue)
                    return false;
                if (tag.tagValue === subTag.tagValue)
                    foundMatch = true;
            }
            if (!foundMatch)
                return false;
        }
        return true;
    }
    matches(rel) {
        if (this.hasDoubleStar)
            return true;
        // Query must have equal number (or greater, for inherit) of tags as the relation.
        if (rel.tagCount() > this.tagCount) {
            return false;
        }
        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedTags) {
            if (!rel.includesType(arg.tagType))
                return false;
            if (!arg.tagValue) {
                if (!rel.includesType(arg.tagType))
                    return false;
                if (rel.hasValueForType(arg.tagType))
                    return false;
                continue;
            }
            if (rel.getTagValue(arg.tagType) !== arg.tagValue)
                return false;
        }
        // For all star values: Check that the relation has a tag of this type.
        for (const arg of this.starValueTags) {
            if (!rel.includesType(arg.tagType))
                return false;
        }
        return true;
    }
    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }
    formatRelationRelative(rel) {
        const outTags = [];
        for (const tag of rel.eachTag()) {
            if (this.fixedTagsForType[tag.tagType])
                continue;
            outTags.push(stringifyQuery_1.commandTagToString(tag));
        }
        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.payload()}` : '');
        return str;
    }
    hasType(typeName) {
        return !!this.tagsForType[typeName];
    }
    getOneTagForType(typeName) {
        const tags = this.tagsForType[typeName];
        if (!tags)
            return null;
        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);
        return tags[0];
    }
    dropTagIndex(index) {
        if (index >= this.tags.length)
            throw new Error('index out of range: ' + index);
        const newTags = this.tags.slice(0, index).concat(this.tags.slice(index + 1));
        return new RelationPattern(newTags);
    }
    toRelation() {
        return new Relation_1.default(null, this.fixedTags, null);
    }
    stringify() {
        return stringifyQuery_1.commandTagsToString(this.tags);
    }
}
exports.default = RelationPattern;
function commandToRelationPattern(str) {
    const parsed = parseCommand_1.default(str);
    return new RelationPattern(parsed.tags);
}
exports.commandToRelationPattern = commandToRelationPattern;
function parsePattern(query) {
    const parsed = parseCommand_1.default('get ' + query);
    return new RelationPattern(parsed.tags);
}
exports.parsePattern = parsePattern;
