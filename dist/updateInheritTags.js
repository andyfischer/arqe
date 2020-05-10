"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateInheritTags(cxt) {
    const found = {};
    for (const rel of cxt.getRelations('typeinfo/* option/inherits')) {
        found[rel.getTagValue('typeinfo')] = true;
    }
    return found;
}
exports.default = updateInheritTags;
//# sourceMappingURL=updateInheritTags.js.map