"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InheritTags {
    constructor() {
        this.anyFound = false;
        this.byTypeName = {};
    }
}
exports.default = InheritTags;
function updateInheritTags(cxt) {
    const tags = new InheritTags();
    for (const rel of cxt.getRelations('typeinfo/* option/inherits')) {
        tags.anyFound = true;
        tags.byTypeName[rel.getTagValue('typeinfo')] = true;
    }
    return tags;
}
exports.updateInheritTags = updateInheritTags;
