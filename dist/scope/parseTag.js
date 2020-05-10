"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseTag(tag) {
    const items = tag.split(' ');
    const table = {};
    for (const item of items) {
        table[item] = true;
    }
    return {
        normalizedString: tag,
        tags: items,
        tagTable: table,
        tagCount: items.length
    };
}
exports.default = parseTag;
//# sourceMappingURL=parseTag.js.map