
import Graph from './Graph'
import TupleReceiver from './TupleReceiver'
import { receiveToTupleList } from './receiveUtils'
import Pattern from './Pattern'
import Tuple from './Tuple'
import PatternTag from './PatternTag'
import { emitSearchPatternMeta } from './CommandMeta'
import { patternTagToString } from './stringifyQuery'
import CommandExecutionParams from './CommandExecutionParams'

function annotateRelationsWithMissingIdentifier(searchPattern: Pattern, rels: Pattern[]) {
    const identifierTags: PatternTag[] = []
    for (const tag of searchPattern.tags)
        if (tag.identifier)
            identifierTags.push(tag);

    rels = rels.map(rel => {

        for (const tag of identifierTags) {
            if (!rel.byIdentifier[tag.identifier]) {

                if (!tag.tagType) {
                    throw new Error("annotateRelationsWithMissingIdentifier doesn't know how "
                                    +"to handle ident tag: " + searchPattern.stringify());
                }

                rel = rel.updateTagAtIndex(rel.findTagIndexOfType(tag.tagType), t => t.setIdentifier(tag.identifier) )
            }
        }

        return rel;
    });

    return rels;
}

export function runJoinStep(params: CommandExecutionParams) {
    const { graph, command, input, output } = params;
    const searchPattern = command.pattern;

    let triggeredOutput = false;

    let inputRelations: Pattern[] = [];
    let searchRelations: Pattern[] = [];
    let inputDone = false;
    let searchDone = false;
    let inputSearchPattern: Pattern = null;

    const sendOutput = () => {
        inputRelations = annotateRelationsWithMissingIdentifier(inputSearchPattern, inputRelations);
        searchRelations = annotateRelationsWithMissingIdentifier(searchPattern, searchRelations);
        performJoin(inputSearchPattern, inputRelations, searchPattern, searchRelations, output);
    }

    const check = () => {
        if (triggeredOutput)
            return;

        if (inputDone && searchDone) {
            triggeredOutput = true;
            sendOutput();
        }
    }

    const search = receiveToTupleList((rels) => {
        for (const rel of rels)
            searchRelations.push(rel);

        searchDone = true;
        check();
    });

    graph.tupleStore.searchUnplanned(searchPattern, search);

    input.waitForAll((rels) => {

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

function combineRelations(a: Pattern, b: Pattern) {
    const saw = {}
    const tags = [];

    for (const tag of a.tags) {
        tags.push(tag);
        saw[patternTagToString(tag)] = true;
    }

    for (const tag of b.tags) {
        const str = patternTagToString(tag);
        if (saw[str])
            continue;
        tags.push(tag);
    }

    return new Pattern(tags);
}

function performJoin(inputSearchPattern: Pattern, inputs: Pattern[], searchPattern: Pattern, searchResults: Pattern[], output: TupleReceiver) {

    if (!inputSearchPattern)
        throw new Error('missing inputSearchPattern');

    emitSearchPatternMeta(combineRelations(inputSearchPattern, searchPattern), output)

    // For each search result
    //   Look at all unfilled identifiers in this search result
    //   Check if there is an input relation that:
    //     1) contains at least one of the same identifiers
    //     2) has the same tag in that identifier

    const correspondingTags: { identifier: string, input: PatternTag, search: PatternTag }[] = [];
    const unboundTags: PatternTag[] = []

    for (const identifier in searchPattern.byIdentifier) {
        const identifierKey = searchPattern.byIdentifier[identifier];
        const inputKey = inputSearchPattern.byIdentifier[identifier];
        if (!inputKey) {
            unboundTags.push(identifierKey);
        } else {
            correspondingTags.push({identifier, search: identifierKey, input: inputKey });
        }
    }

    function getKeyForInput(pattern: Pattern) {
        const key = {}
        for (const correspondingTag of correspondingTags)
            key[correspondingTag.identifier] = pattern.getTagValue(correspondingTag.input.tagType);

        return JSON.stringify(key);
    }
    
    function getKeyForSearch(pattern: Pattern) {
        const key = {}
        for (const correspondingTag of correspondingTags)
            key[correspondingTag.identifier] = pattern.getTagValue(correspondingTag.search.tagType);

        return JSON.stringify(key);
    }

    const keyed = {}
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
