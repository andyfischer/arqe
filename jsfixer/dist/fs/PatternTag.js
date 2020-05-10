"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class PatternTag {
    str() {
        return stringifyQuery_1.patternTagToString(this);
    }
    stringify() {
        return stringifyQuery_1.patternTagToString(this);
    }
    copy() {
        const tag = new PatternTag();
        tag.tagType = this.tagType;
        tag.tagValue = this.tagValue;
        tag.negate = this.negate;
        tag.star = this.star;
        tag.doubleStar = this.doubleStar;
        tag.starValue = this.starValue;
        tag.questionValue = this.questionValue;
        tag.identifier = this.identifier;
        return tag;
    }
    freeze() {
        if (this.isFrozen)
            return;
        this.isFrozen = true;
        Object.freeze(this);
        return this;
    }
    setValue(value) {
        const out = this.copy();
        out.tagValue = value;
        delete out.starValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }
    setStarValue() {
        const out = this.copy();
        out.starValue = true;
        delete out.tagValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }
    setIdentifier(id) {
        const out = this.copy();
        out.identifier = id;
        out.freeze();
        return out;
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
    if (tag.tagValue === undefined)
        tag.tagValue = null;
    return tag;
}
exports.newTagFromObject = newTagFromObject;
//# sourceMappingURL=PatternTag.js.map