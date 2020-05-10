"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = require("./RelationPattern");
function emitCommandMeta(output, fields) {
    const tags = [
        { tagType: 'command-meta', tagValue: null }
    ];
    for (const k in fields) {
        tags.push({ tagType: k, tagValue: fields[k] });
    }
    output.relation(RelationPattern_1.commandTagsToRelation(tags, null));
}
exports.emitCommandMeta = emitCommandMeta;
function emitCommandError(output, msg) {
    const tags = [
        { tagType: 'command-meta', tagValue: null },
        { tagType: 'error', tagValue: null }
    ];
    output.relation(RelationPattern_1.commandTagsToRelation(tags, msg));
}
exports.emitCommandError = emitCommandError;
function emitMetaInfoForUnboundVars(pattern, output) {
    for (const tag of pattern.tags) {
        if (tag.unboundType) {
            emitCommandMeta(output, { unboundType: null, var: tag.unboundType });
        }
        if (tag.unboundValue) {
            emitCommandMeta(output, { unboundValue: null, 'type': tag.tagType, var: tag.unboundValue });
        }
    }
}
exports.emitMetaInfoForUnboundVars = emitMetaInfoForUnboundVars;
//# sourceMappingURL=CommandMeta.js.map