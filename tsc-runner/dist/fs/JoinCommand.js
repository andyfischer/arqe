"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Search_1 = require("./Search");
const RelationReceiver_1 = require("./RelationReceiver");
const CommandMeta_1 = require("./CommandMeta");
function setupJoinExecution(commandExec) {
    let triggeredOutput = false;
    let inputRelations = null;
    let searchRelations = null;
    const pattern = commandExec.command.toPattern();
    commandExec.input = RelationReceiver_1.collectRelationReceiverOutput((rels) => {
        inputRelations = rels;
        check();
    });
    const search = RelationReceiver_1.collectRelationReceiverOutput((rels) => {
        searchRelations = rels;
        check();
    });
    CommandMeta_1.emitMetaInfoForUnboundVars(pattern, search);
    commandExec.start = () => {
        commandExec.output.start();
        Search_1.runSearch(commandExec.graph, { pattern, subSearchDepth: 0, ...search });
    };
    const check = () => {
        if (triggeredOutput)
            return;
        if (inputRelations !== null && searchRelations !== null) {
            triggeredOutput = true;
            sendOutput();
        }
    };
    const sendOutput = () => {
        const inputs = new RelationListWithMeta();
        inputs.addAll(inputRelations);
        const searchResults = new RelationListWithMeta();
        searchResults.addAll(searchRelations);
        runJoin(inputs, searchResults, commandExec.output);
    };
}
exports.setupJoinExecution = setupJoinExecution;
class RelationListWithMeta {
    constructor() {
        this.unboundValueTypes = [];
        this.relations = [];
    }
    add(rel) {
        if (rel.hasType('command-meta')) {
            if (rel.hasType('unboundValue'))
                this.unboundValueTypes.push(rel.getTagValue('type'));
            return;
        }
        this.relations.push(rel);
    }
    addAll(rels) {
        for (const rel of rels)
            this.add(rel);
    }
}
function runJoin(inputs, searchResults, output) {
    if (inputs.unboundValueTypes.length !== searchResults.unboundValueTypes.length)
        throw new Error('mismatch on unbound types: ' + inputs.unboundValueTypes + ' compared to ' + searchResults.unboundValueTypes);
    if (inputs.unboundValueTypes.length !== 1)
        throw new Error('join only supports one unbound right now');
    const keyed = {};
    for (const rel of inputs.relations) {
        const key = rel.getTagValue(inputs.unboundValueTypes[0]);
        keyed[key] = rel;
    }
    for (const rel of searchResults.relations) {
        const key = rel.getTagValue(searchResults.unboundValueTypes[0]);
        if (keyed[key])
            output.relation(rel);
    }
    output.finish();
}
//# sourceMappingURL=JoinCommand.js.map