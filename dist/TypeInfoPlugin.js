"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypeInfoPlugin {
    constructor() {
        this.name = 'TypeInfo';
    }
    afterRelationUpdated(command, rel) {
        if (!rel.has('typeinfo'))
            return;
        const graph = rel.graph;
        const tagType = graph.findTagType(rel.get('typeinfo'));
        if (rel.getOptional('option', null) === 'inherits') {
            tagType.inherits = true;
            return;
        }
        if (rel.getOptional('option', null) === 'order') {
            graph.ordering.updateInfo(rel);
            return;
        }
    }
}
exports.default = TypeInfoPlugin;
//# sourceMappingURL=TypeInfoPlugin.js.map