
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './Search'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import Relation from './Relation'
import { emitMetaInfoForUnboundVars } from './CommandMeta'

export function setupJoinExecution(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    let triggeredOutput = false;

    let inputRelations: Relation[] = null;
    let searchRelations: Relation[] = null;
    const pattern = commandExec.command.toPattern();

    commandExec.input = collectRelationReceiverOutput((rels) => {
        console.log('join got input: ', rels)
        inputRelations = rels;
        check();
    });

    const search = collectRelationReceiverOutput((rels) => {
        console.log('join finished search: ', rels)
        searchRelations = rels;
        check();
    });

    emitMetaInfoForUnboundVars(pattern, search);

    commandExec.start = () => {
        commandExec.output.start();
        runSearch(commandExec.graph, { pattern, ...search } );
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
    relations: Relation[] = []

    add(rel: Relation) {
        if (rel.includesType('command-meta')) {
            if (rel.includesType('unboundValue'))
                this.unboundValueTypes.push(rel.getTagValue('type') as string);

            return;
        }

        this.relations.push(rel);
    }

    addAll(rels: Relation[]) {
        for (const rel of rels)
            this.add(rel);
    }
}

class KeyedRelations {

    keyByType: string
    map: {[tag: string]: Relation } = {}

    add(rel: Relation) {
        const tag = rel.getTag(this.keyByType);
        this.map[tag] = rel;
    }

    findForKey(rel: Relation) {
        const tag = rel.getTag(this.keyByType);
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
