"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class PatternTag {
    str() {
        return stringifyQuery_1.commandTagToString(this);
    }
    copy() {
        const tag = new PatternTag();
        for (const k in this) {
            if (k !== 'isFrozen')
                tag[k] = this[k];
        }
        return tag;
    }
    freeze() {
        if (this.isFrozen)
            return;
        this.isFrozen = true;
        Object.freeze(this);
        return this;
    }
}
exports.default = PatternTag;
function newTag(tagType, tagValue) {
    const tag = new PatternTag();
    tag.tagType = tagType;
    tag.tagValue = tagValue;
    return tag;
}
exports.newTag = newTag;
function newTagFromObject(obj) {
    const tag = new PatternTag();
    for (const k in obj)
        tag[k] = obj[k];
    return tag;
}
exports.newTagFromObject = newTagFromObject;
