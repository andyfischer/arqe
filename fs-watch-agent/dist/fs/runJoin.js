"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runSearch_1 = __importDefault(require("./runSearch"));
const receivers_1 = require("./receivers");
const Pattern_1 = require("./Pattern");
const CommandMeta_1 = require("./CommandMeta");
const stringifyQuery_1 = require("./stringifyQuery");
function annotateRelationsWithMissingIdentifier(searchPattern, rels) {
    const identifierTags = [];
    for (const tag of searchPattern.tags)
        if (tag.identifier)
            identifierTags.push(tag);
    rels = rels.map(rel => {
        for (const tag of identifierTags) {
            if (!rel.byIdentifier[tag.identifier]) {
                if (!tag.tagType) {
                    throw new Error("annotateRelationsWithMissingIdentifier doesn't know how "
                        + "to handle ident tag: " + searchPattern.stringify());
                }
                rel = rel.updateTagAtIndex(rel.findTagIndexOfType(tag.tagType), t => t.setIdentifier(tag.identifier));
            }
        }
        return rel;
    });
    return rels;
}
function runJoinStep(step) {
    let triggeredOutput = false;
    let inputRelations = [];
    let searchRelations = [];
    let inputDone = false;
    let searchDone = false;
    let inputSearchPattern = null;
    const searchPattern = step.command.toPattern();
    const sendOutput = () => {
        inputRelations = annotateRelationsWithMissingIdentifier(inputSearchPattern, inputRelations);
        searchRelations = annotateRelationsWithMissingIdentifier(searchPattern, searchRelations);
        runJoin(inputSearchPattern, inputRelations, searchPattern, searchRelations, step.output);
    };
    const check = () => {
        if (triggeredOutput)
            return;
        if (inputDone && searchDone) {
            triggeredOutput = true;
            sendOutput();
        }
    };
    const search = receivers_1.receiveToRelationList((rels) => {
        for (const rel of rels)
            searchRelations.push(rel);
        searchDone = true;
        check();
    });
    runSearch_1.default(step.graph, { pattern: searchPattern, subSearchDepth: 0, ...search });
    step.input.waitForAll((rels) => {
        for (const rel of rels) {
            if (rel.hasType('command-meta')) {
                if (rel.hasType('search-pattern')) {
                    inputSearchPattern = rel;
                }
                continue;
            }
            inputRelations.push(rel);
        }
        inputDone = true;
        check();
    });
}
exports.runJoinStep = runJoinStep;
function combineRelations(a, b) {
    const saw = {};
    const tags = [];
    for (const tag of a.tags) {
        tags.push(tag);
        saw[stringifyQuery_1.patternTagToString(tag)] = true;
    }
    for (const tag of b.tags) {
        const str = stringifyQuery_1.patternTagToString(tag);
        if (saw[str])
            continue;
        tags.push(tag);
    }
    return new Pattern_1.PatternValue(tags);
}
function runJoin(inputSearchPattern, inputs, searchPattern, searchResults, output) {
    if (!inputSearchPattern)
        throw new Error('missing inputSearchPattern');
    CommandMeta_1.emitSearchPatternMeta(combineRelations(inputSearchPattern, searchPattern), output);
    const correspondingTags = [];
    const unboundTags = [];
    for (const identifier in searchPattern.byIdentifier) {
        const identifierKey = searchPattern.byIdentifier[identifier];
        const inputKey = inputSearchPattern.byIdentifier[identifier];
        if (!inputKey) {
            unboundTags.push(identifierKey);
        }
        else {
            correspondingTags.push({ identifier, search: identifierKey, input: inputKey });
        }
    }
    function getKeyForInput(pattern) {
        const key = {};
        for (const correspondingTag of correspondingTags)
            key[correspondingTag.identifier] = pattern.getTagValue(correspondingTag.input.tagType);
        return JSON.stringify(key);
    }
    function getKeyForSearch(pattern) {
        const key = {};
        for (const correspondingTag of correspondingTags)
            key[correspondingTag.identifier] = pattern.getTagValue(correspondingTag.search.tagType);
        return JSON.stringify(key);
    }
    const keyed = {};
    for (const input of inputs)
        keyed[getKeyForInput(input)] = input;
    for (const search of searchResults) {
        const key = getKeyForSearch(search);
        const relatedInput = keyed[key];
        if (!relatedInput)
            continue;
        output.relation(combineRelations(relatedInput, search));
    }
    output.finish();
}
//# sourceMappingURL=runJoin.js.map