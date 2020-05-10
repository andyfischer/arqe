"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importStar(require("./parseCommand"));
const stringifyQuery_1 = require("./stringifyQuery");
class Pattern {
    constructor(tags) {
        this.tags = [];
        this.starValueTags = [];
        this.fixedTags = [];
        this.fixedTagsForType = {};
        this.tagsForType = {};
        this.isFrozen = false;
        this.tags = tags;
        for (const tag of tags) {
            const { tagType } = tag;
            if (!this.tagsForType[tagType])
                this.tagsForType[tagType] = [];
            this.tagsForType[tagType].push(tag);
            if (tag.doubleStar) {
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
    freeze() {
        this.isFrozen = true;
        for (const tag of this.tags)
            Object.freeze(tag);
        Object.freeze(this.tags);
    }
    copy() {
        const pattern = new Pattern(this.tags.map(t => ({ ...t })));
        pattern.payload = this.payload;
        pattern.payloadUnavailable = this.payloadUnavailable;
        return pattern;
    }
    copyWithNewTags(tags) {
        const pattern = new Pattern(tags);
        pattern.payload = this.payload;
        pattern.payloadUnavailable = this.payloadUnavailable;
        return pattern;
    }
    getNtag() {
        if (this.ntag == null)
            this.ntag = stringifyQuery_1.normalizeExactTag(this.tags);
        return this.ntag;
    }
    tagCount() {
        return this.tags.length;
    }
    hasPayload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");
        return this.payload != null;
    }
    getValue() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");
        return this.payload;
    }
    getPayload() {
        return this.getValue();
    }
    setValue(payload) {
        if (this.isFrozen)
            throw new Error("can't setValue on frozen pattern");
        if (payload === '#exists') {
            throw new Error("don't use #exists as payload");
            payload = null;
        }
        this.payload = payload;
    }
    setPayload(payload) {
        this.setValue(payload);
    }
    isSupersetOf(subPattern) {
        if (this.hasDoubleStar)
            return true;
        if (this.tagCount() !== subPattern.tagCount())
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
        if (this.hasDoubleStar) {
            if (rel.tagCount() < this.tagCount())
                return false;
        }
        else {
            if (rel.tagCount() !== this.tagCount())
                return false;
        }
        for (const arg of this.fixedTags) {
            if (!rel.hasType(arg.tagType))
                return false;
            if (!arg.tagValue) {
                if (!rel.hasType(arg.tagType))
                    return false;
                if (rel.hasValueForType(arg.tagType))
                    return false;
                continue;
            }
            if (rel.getTagValue(arg.tagType) !== arg.tagValue)
                return false;
        }
        for (const arg of this.starValueTags) {
            if (!rel.hasType(arg.tagType))
                return false;
        }
        return true;
    }
    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }
    formatRelationRelative(rel) {
        const outTags = [];
        for (const tag of rel.tags) {
            if (this.fixedTagsForType[tag.tagType])
                continue;
            outTags.push(stringifyQuery_1.commandTagToString(tag));
        }
        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');
        return str;
    }
    hasType(typeName) {
        return !!this.tagsForType[typeName];
    }
    hasValueForType(typeName) {
        if (!this.hasType(typeName))
            return false;
        for (const tag of this.tagsForType[typeName])
            if (tag.tagValue != null)
                return true;
        return false;
    }
    getOneTagForType(typeName) {
        const tags = this.tagsForType[typeName];
        if (!tags)
            return null;
        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);
        return tags[0];
    }
    getTag(typeName) {
        const tag = this.getOneTagForType(typeName);
        if (!tag.tagValue)
            return typeName;
        return typeName + '/' + tag.tagValue;
    }
    getTagString(typeName) {
        return this.getTag(typeName);
    }
    getTagValue(typeName) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error(`type "${typeName}" not found in pattern: ${this.stringify()}`);
        return tag.tagValue;
    }
    getTagValueOptional(typeName, defaultValue) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            return defaultValue;
        return tag.tagValue;
    }
    dropTagIndex(index) {
        if (index >= this.tags.length)
            throw new Error('index out of range: ' + index);
        return this.copyWithNewTags(this.tags.slice(0, index).concat(this.tags.slice(index + 1)));
    }
    removeType(typeName) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.tagType !== typeName));
    }
    addTag(s) {
        return this.copyWithNewTags(this.tags.concat([parseCommand_1.parseTag(s)]));
    }
    stringify() {
        return stringifyQuery_1.commandTagsToString(this.tags);
    }
    stringifyToCommand() {
        let commandPrefix = 'set ';
        if (this.wasDeleted)
            commandPrefix = 'delete ';
        const payloadStr = (this.payload != null) ? (' == ' + this.payload) : '';
        return commandPrefix + stringifyQuery_1.commandTagsToString(this.tags) + payloadStr;
    }
}
exports.default = Pattern;
function commandToRelationPattern(str) {
    const parsed = parseCommand_1.default(str);
    return new Pattern(parsed.tags);
}
exports.commandToRelationPattern = commandToRelationPattern;
function commandTagsToRelation(tags, payload) {
    const pattern = new Pattern(tags);
    pattern.setPayload(payload);
    return pattern;
}
exports.commandTagsToRelation = commandTagsToRelation;
function parsePattern(query) {
    const parsed = parseCommand_1.default('get ' + query);
    return new Pattern(parsed.tags);
}
exports.parsePattern = parsePattern;
//# sourceMappingURL=Pattern.js.map