"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const beforeSection = 1;
const unknownSection = 2;
const afterSection = 3;
class TagTypeOrdering {
    constructor() {
        this.section = {};
        this.update = (cxt) => {
            for (const rel of cxt.getRelations('typeinfo/* option/order')) {
                const typeName = rel.getTagValue('typeinfo');
                const value = rel.payload();
                if (value === 'before') {
                    this.section[typeName] = beforeSection;
                }
                else if (value === 'after') {
                    this.section[typeName] = afterSection;
                }
                else {
                    throw new Error('invalid typeinfo order: ' + value);
                }
            }
        };
    }
    compareTagTypes(a, b) {
        const aSection = this.section[a] || unknownSection;
        const bSection = this.section[b] || unknownSection;
        if (aSection !== bSection)
            return (aSection < bSection) ? -1 : 1;
        return a.localeCompare(b);
    }
}
exports.default = TagTypeOrdering;
