"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringifyRelationTags(tags, schema) {
    if (schema) {
        tags.sort((a, b) => {
            return schema.ordering.compareTagTypes(a.tagType, b.tagType);
        });
    }
    const args = keys.map(key => {
        const value = this.getTagValue(key);
        if (key === 'option')
            return '.' + value;
        let str = key;
        if (value !== true)
            str += `/${value}`;
        return str;
    });
}
exports.default = stringifyRelationTags;
//# sourceMappingURL=stringifyRelation.js.map