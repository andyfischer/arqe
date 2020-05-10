"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
function receiveToStrings(onDone) {
    let searchPattern = null;
    let actionPerformed = null;
    let outputExists = false;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError = null;
    const rels = [];
    function stringifyRelation(rel) {
        const tags = rel.tags.filter(tag => {
            if (searchPattern && !outputExtended && searchPattern.fixedTagsForType[tag.tagType])
                return false;
            return true;
        });
        const tagStrs = tags.map(stringifyQuery_1.commandTagToString);
        let str = tagStrs.join(' ');
        if (!outputList)
            str += (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');
        if (rel.wasDeleted) {
            str = 'delete ' + str;
        }
        return str;
    }
    return {
        start() { },
        relation: (rel) => {
            if (rel.hasType('command-meta')) {
                if (rel.hasType('action-performed')) {
                    actionPerformed = rel;
                    return;
                }
                if (rel.hasType('search-pattern')) {
                    searchPattern = rel
                        .removeType('command-meta')
                        .removeType('search-pattern')
                        .freeze();
                    return;
                }
                if (rel.hasType('output-flag')) {
                    if (rel.getTagValue('output-flag') === 'exists')
                        outputExists = true;
                    if (rel.getTagValue('output-flag') === 'count')
                        outputCount = true;
                    if (rel.getTagValue('output-flag') === 'extended')
                        outputExtended = true;
                    if (rel.getTagValue('output-flag') === 'list')
                        outputList = true;
                    return;
                }
                if (rel.hasType('error')) {
                    if (!sawError)
                        sawError = rel;
                    return;
                }
            }
            rels.push(rel);
        },
        isDone() { return false; },
        finish: () => {
            if (sawError) {
                onDone('#error ' + sawError.getPayload());
                return;
            }
            if (actionPerformed) {
                onDone('#done');
                return;
            }
            if (searchPattern && !searchPattern.isMultiMatch()) {
                if (rels.length === 0) {
                    onDone('#null');
                }
                else {
                    if (rels[0].hasPayload()) {
                        onDone(rels[0].getPayload());
                    }
                    else if (outputExtended) {
                        onDone('set ' + rels[0].stringifyRelation());
                    }
                    else {
                        onDone('#exists');
                    }
                }
                return;
            }
            if (outputExists) {
                if (rels.length === 0)
                    onDone('#null');
                else
                    onDone('#exists');
                return;
            }
            if (outputCount) {
                onDone(rels.length + '');
                return;
            }
            onDone(rels.map(rel => stringifyRelation(rel)));
        }
    };
}
exports.default = receiveToStrings;
//# sourceMappingURL=receiveToStrings.js.map