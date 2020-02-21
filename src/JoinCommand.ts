
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './Search'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import RelationPattern from './RelationPattern'
import { emitMetaInfoForUnboundVars } from './CommandMeta'

export function setupJoinExecution(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    let triggeredOutput = false;

    let inputRelations: RelationPattern[] = null;
    let searchRelations: RelationPattern[] = null;
    const pattern = commandExec.command.toPattern();

    commandExec.input = collectRelationReceiverOutput((rels) => {
        inputRelations = rels;
        check();
    });

    const search = collectRelationReceiverOutput((rels) => {
        searchRelations = rels;
        check();
    });

    emitMetaInfoForUnboundVars(pattern, search);

    commandExec.start = () => {
        commandExec.output.start();
        runSearch(commandExec.graph, { pattern, subSearchDepth: 0, ...search } );
    }

    const check = () => {
        if (triggeredOutput)
            return;

        if (inputRelations !== null && searchRelations !== null) {
            triggeredOutput = true;
            sendOutput();
        }
    }

    const sendOutput = () => {
        const inputs = new RelationListWithMeta();
        inputs.addAll(inputRelations);

        const searchResults = new RelationListWithMeta();
        searchResults.addAll(searchRelations);

        runJoin(inputs, searchResults, commandExec.output);
    }
}

class RelationListWithMeta {
    unboundValueTypes: string[] = []
    relations: RelationPattern[] = []

    add(rel: RelationPattern) {
        if (rel.hasType('command-meta')) {
            if (rel.hasType('unboundValue'))
                this.unboundValueTypes.push(rel.getTagValue('type') as string);

            return;
        }

        this.relations.push(rel);
    }

    addAll(rels: RelationPattern[]) {
        for (const rel of rels)
            this.add(rel);
    }
}

class KeyedRelations {

    keyByType: string
    map: {[tag: string]: RelationPattern } = {}

    add(rel: RelationPattern) {
        const tag = rel.getTagString(this.keyByType);
        this.map[tag] = rel;
    }

    findForKey(rel: RelationPattern) {
        const tag = rel.getTagString(this.keyByType);
        return this.map[tag];
    }
}

function runJoin(inputs: RelationListWithMeta, searchResults: RelationListWithMeta, output: RelationReceiver) {


    if (inputs.unboundValueTypes.length !== searchResults.unboundValueTypes.length)
        throw new Error('mismatch on unbound types: ' + inputs.unboundValueTypes + ' compared to ' + searchResults.unboundValueTypes);

    if (inputs.unboundValueTypes.length !== 1)
        throw new Error('join only supports one unbound right now');

    if (inputs.unboundValueTypes[0] !== searchResults.unboundValueTypes[0])
        throw new Error('expected unbound types to be the same');

    const keyedInputs = new KeyedRelations();
    keyedInputs.keyByType = inputs.unboundValueTypes[0];

    for (const rel of inputs.relations)
        keyedInputs.add(rel);

    for (const rel of searchResults.relations)
        if (keyedInputs.findForKey(rel))
            output.relation(rel);

    output.finish();
}
