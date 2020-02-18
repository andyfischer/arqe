
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './GetOperation'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import Relation from './Relation'

export function setupJoinExecution(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    let triggeredOutput = false;

    let inputRels: Relation[] = null;
    let searchRels: Relation[] = null;

    commandExec.input = collectRelationReceiverOutput((rels) => {
        console.log('join got input: ', rels)
        inputRels = rels;
        check();
    });

    const search = collectRelationReceiverOutput((rels) => {
        console.log('join finished search: ', rels)
        searchRels = rels;
        check();
    });

    commandExec.start = () => {
        commandExec.output.start();
        const pattern = commandExec.command.toPattern();
        runSearch(commandExec.graph, { pattern, ...search } );
    }

    const check = () => {
        if (triggeredOutput)
            return;

        if (inputRels !== null && searchRels !== null) {
            triggeredOutput = true;
            sendOutput();
        }
    }

    const sendOutput = () => {
        console.log('join has finished!')
        commandExec.output.finish();
    }
}
