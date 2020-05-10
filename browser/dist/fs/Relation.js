"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class Relation {
    constructor(ntag, tags, payloadStr) {
        this.tagsForType = {};
        this.ntag = ntag || stringifyQuery_1.normalizeExactTag(tags);
        if (typeof payloadStr !== 'string' && payloadStr !== null)
            throw new Error('invalid value for payloadStr: ' + payloadStr);
        if (payloadStr === '#exists')
            payloadStr = null;
        this.payloadStr = payloadStr;
        this.tags = tags;
        for (const arg of tags) {
            if (!this.tagsForType[arg.tagType])
                this.tagsForType[arg.tagType] = [];
            this.tagsForType[arg.tagType].push(arg);
        }
    }
    hasPayload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");
        return this.payloadStr != null;
    }
    payload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");
        return this.payloadStr;
    }
    *eachTag() {
        for (const tag of this.tags)
            yield tag;
    }
    setPayload(payloadStr) {
        this.payloadStr = payloadStr;
    }
    getOptional(typeName, defaultValue) {
        const found = this.tagsForType[typeName];
        if (!found)
            return defaultValue;
        return found[0].tagValue;
    }
    includesType(name) {
        return this.tagsForType[name] !== undefined;
    }
    hasValueForType(name) {
        if (!this.tagsForType[name])
            return false;
        for (const tag of this.tagsForType[name])
            if (tag.tagValue !== null)
                return true;
        return false;
    }
    tagCount() {
        return this.tags.length;
    }
    getTag(typeName) {
        const found = this.tagsForType[typeName];
        if (!found)
            throw new Error("type not found: " + typeName);
        if (!found[0].tagValue)
            return typeName;
        return typeName + '/' + found[0].tagValue;
    }
    getTagValue(typeName) {
        const found = this.tagsForType[typeName];
        if (!found)
            throw new Error("type not found: " + typeName);
        if (!found[0].tagValue)
            return true;
        return found[0].tagValue;
    }
    stringify(schema) {
        const keys = this.tags.map(t => t.tagType);
        if (schema)
            keys.sort((a, b) => schema.ordering.compareTagTypes(a, b));
        const args = keys.map(key => {
            const value = this.getTagValue(key);
            if (key === 'option')
                return '.' + value;
            let str = key;
            if (value !== true)
                str += `/${value}`;
            return str;
        });
        let payload = '';
        if (this.payloadStr !== null) {
            payload = ' == ' + this.payloadStr;
        }
        return 'set ' + args.join(' ') + payload;
    }
}
exports.default = Relation;
function commandTagsToRelation(tags, payload) {
    const relationTags = tags.map(t => ({
        tagType: t.tagType,
        tagValue: t.tagValue
    }));
    return new Relation(null, relationTags, payload);
}
exports.commandTagsToRelation = commandTagsToRelation;
