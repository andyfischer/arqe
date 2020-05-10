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
    // Only emit if the pattern has any identifiers.
    for (const tag of pattern.tags) {
        if (tag.identifier) {
            let metaPattern = pattern.copy()
                .addTag('command-meta')
                .addTag('search-pattern');
            output.relation(metaPattern);
            return;
        }
    }
}
exports.emitSearchPatternMeta = emitSearchPatternMeta;
