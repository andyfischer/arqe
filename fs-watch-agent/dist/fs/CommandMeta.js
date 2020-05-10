"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = require("./Pattern");
const PatternTag_1 = require("./PatternTag");
function emitCommandMeta(output, fields) {
    const tags = [
        PatternTag_1.newTag('command-meta')
    ];
    for (const k in fields) {
        tags.push(PatternTag_1.newTag(k, fields[k]));
    }
    output.relation(Pattern_1.commandTagsToRelation(tags, null));
}
exports.emitCommandMeta = emitCommandMeta;
function emitCommandError(output, msg) {
    const tags = [
        PatternTag_1.newTag('command-meta'),
        PatternTag_1.newTag('error')
    ];
    output.relation(Pattern_1.commandTagsToRelation(tags, msg));
}
exports.emitCommandError = emitCommandError;
function emitSearchPatternMeta(pattern, output) {
    output.relation(pattern.addTags(['command-meta', 'search-pattern']));
}
exports.emitSearchPatternMeta = emitSearchPatternMeta;
function emitActionPerformed(output) {
    emitCommandMeta(output, { 'action-performed': true });
}
exports.emitActionPerformed = emitActionPerformed;
function emitCommandOutputFlags(command, output) {
    if (command.flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' });
    if (command.flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' });
    if (command.flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' });
    if (command.flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' });
}
exports.emitCommandOutputFlags = emitCommandOutputFlags;
function emitRelationDeleted(pattern, output) {
    const rel = pattern.addTags(['command-meta', 'deleted']);
    output.relation(rel);
}
exports.emitRelationDeleted = emitRelationDeleted;
//# sourceMappingURL=CommandMeta.js.map