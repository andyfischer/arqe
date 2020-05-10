"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
function receiveToStringList(onDone) {
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
        const tagStrs = tags.map(stringifyQuery_1.patternTagToString);
        tagStrs.sort();
        let str = tagStrs.join(' ');
        return str;
    }
    return {
        relation: (rel) => {
            if (rel.hasType('command-meta')) {
                if (rel.hasType('action-performed')) {
                    actionPerformed = rel;
                    return;
                }
                if (rel.hasType('search-pattern')) {
                    searchPattern = rel.removeTypes(['command-meta', 'search-pattern']);
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
        finish: () => {
            if (sawError) {
                onDone('#error ' + sawError.getTagValue('message'));
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
                    if (outputExtended) {
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
exports.default = receiveToStringList;
//# sourceMappingURL=receiveToStringList.js.map