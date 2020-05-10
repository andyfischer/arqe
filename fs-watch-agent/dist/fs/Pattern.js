"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importStar(require("./parseCommand"));
const stringifyQuery_1 = require("./stringifyQuery");
const PatternTag_1 = __importDefault(require("./PatternTag"));
class PatternValue {
    constructor(tags) {
        this.tags = [];
        this.starValueTags = [];
        this.fixedTags = [];
        this.fixedTagsForType = {};
        this.tagsForType = {};
        this.byIdentifier = {};
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");
        this.tags = tags;
        this.updateDerivedData();
        Object.freeze(this.tags);
    }
    updateDerivedData() {
        if (this.hasDerivedData)
            return;
        for (const tag of this.tags) {
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
            if (tag.identifier)
                this.byIdentifier[tag.identifier] = tag;
        }
        this.hasDerivedData = true;
    }
    copyWithNewTags(tags) {
        const pattern = new PatternValue(tags);
        pattern.payload = this.payload;
        pattern.payloadUnavailable = this.payloadUnavailable;
        return pattern;
    }
    remapTags(func) {
        const tags = this.tags.map(func);
        return this.copyWithNewTags(tags);
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
        if (payload === '#exists') {
            throw new Error("don't use #exists as payload");
            payload = null;
        }
        this.payload = payload;
    }
    setPayload(payload) {
        this.setValue(payload);
        return this;
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
                if (!tag.tagValue || (tag.tagValue === subTag.tagValue))
                    foundMatch = true;
            }
            if (!foundMatch)
                return false;
        }
        return true;
    }
    matches(rel) {
        if (this.hasDoubleStar) {
            const tagCountWithoutDoubleStar = this.tagCount() - 1;
            if (rel.tagCount() < tagCountWithoutDoubleStar)
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
            outTags.push(stringifyQuery_1.patternTagToString(tag));
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
    getTagObject(typeName) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error('tag not found for type: ' + typeName);
        return tag;
    }
    getTag(typeName) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error('tag not found for type: ' + typeName);
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
    setTagValueAtIndex(index, value) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        tags[index].tagValue = value;
        return this.copyWithNewTags(tags);
    }
    findTagWithType(tagType) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].tagType === tagType)
                return this.tags[i];
        return null;
    }
    findTagIndexOfType(tagType) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].tagType === tagType)
                return i;
        return -1;
    }
    updateTagOfType(tagType, update) {
        const index = this.findTagIndexOfType(tagType);
        if (index === -1)
            throw new Error('tag type not found: ' + tagType);
        return this.updateTagAtIndex(index, update);
    }
    updateTagAtIndex(index, update) {
        const tags = this.tags.map(t => t);
        tags[index] = update(tags[index]);
        return this.copyWithNewTags(tags);
    }
    removeType(typeName) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.tagType !== typeName));
    }
    removeTypes(typeNames) {
        return this.copyWithNewTags(this.tags.filter(tag => typeNames.indexOf(tag.tagType) === -1));
    }
    addTag(s) {
        return this.copyWithNewTags(this.tags.concat([parseCommand_1.parseTag(s)]));
    }
    addTags(strs) {
        return this.copyWithNewTags(this.tags.concat(strs.map(parseCommand_1.parseTag)));
    }
    str() {
        return stringifyQuery_1.commandTagsToString(this.tags);
    }
    stringify() {
        return stringifyQuery_1.commandTagsToString(this.tags);
    }
    stringifyRelation() {
        const payloadStr = (this.payload != null) ? (' == ' + this.payload) : '';
        return this.stringify() + payloadStr;
    }
    stringifyToCommand() {
        let commandPrefix = 'set ';
        return commandPrefix + this.stringifyRelation();
    }
}
exports.PatternValue = PatternValue;
function commandToRelationPattern(str) {
    const parsed = parseCommand_1.default(str);
    return new PatternValue(parsed.tags);
}
exports.commandToRelationPattern = commandToRelationPattern;
function patternFromMap(map) {
    const tags = [];
    for (const [key, value] of map.entries()) {
        const tag = new PatternTag_1.default();
        tag.tagType = key;
        tag.tagValue = value;
        tags.push(tag);
    }
    return new PatternValue(tags);
}
exports.patternFromMap = patternFromMap;
function commandTagsToRelation(tags, payload) {
    const pattern = new PatternValue(tags);
    pattern.setPayload(payload);
    return pattern;
}
exports.commandTagsToRelation = commandTagsToRelation;
function parsePattern(query) {
    const parsed = parseCommand_1.default('get ' + query);
    return new PatternValue(parsed.tags);
}
exports.parsePattern = parsePattern;
//# sourceMappingURL=Pattern.js.map