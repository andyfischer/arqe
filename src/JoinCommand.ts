
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './Search'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import Pattern, { PatternTag } from './Pattern'
import { emitSearchPatternMeta } from './CommandMeta'

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

                rel = rel.getWriteable();
                rel.tagsForType[tag.tagType][0].identifier = tag.identifier;
            }
        }

        return rel;
    });

    return rels;
}

export function setupJoinExecution(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    let triggeredOutput = false;

    let inputRelations: Pattern[] = [];
    let searchRelations: Pattern[] = [];
    let inputDone = false;
    let searchDone = false;
    let inputSearchPattern: Pattern = null;

    const searchPattern = commandExec.command.toPattern();

    commandExec.input = collectRelationReceiverOutput((rels) => {

        for (const rel of rels) {
            if (rel.hasType('command-meta')) {
                if (rel.hasType('search-pattern')) {
                    inputSearchPattern = rel.freeze();

                    console.log('join saw inputSearchPattern: ', inputSearchPattern.stringify())
                }
                continue;
            }

            inputRelations.push(rel);
        }

        inputDone = true;
        check();
    });

    const search = collectRelationReceiverOutput((rels) => {
        for (const rel of rels)
            searchRelations.push(rel);

        searchDone = true;
        check();
    });

    // emitSearchPatternMeta(searchPattern, search);

    commandExec.start = () => {
        commandExec.output.start();
        runSearch(commandExec.graph, { pattern: searchPattern, subSearchDepth: 0, ...search } );
    }

    const check = () => {
        if (triggeredOutput)
            return;

        if (inputDone && searchDone) {
            triggeredOutput = true;
            sendOutput();
        }
    }

    const sendOutput = () => {
        inputRelations = annotateRelationsWithMissingIdentifier(inputSearchPattern, inputRelations);
        searchRelations = annotateRelationsWithMissingIdentifier(searchPattern, searchRelations);
        runJoin(inputSearchPattern, inputRelations, searchPattern, searchRelations, commandExec.output);
    }
}

function combineRelations(a: Pattern, b: Pattern) {
    const saw = {}
    const tags = [];


    return new Pattern(a.tags.concat(b.tags));
}

function runJoin(inputSearchPattern: Pattern, inputs: Pattern[], searchPattern: Pattern, searchResults: Pattern[], output: RelationReceiver) {

    if (!inputSearchPattern)
        throw new Error('missing inputSearchPattern');

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

    for (const input of inputs)
        console.log('join looking at: ', input.stringify())

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
            console.log('no related input: ', search.stringify())

        output.relation(combineRelations(relatedInput, search));
    }

    output.finish();
}
