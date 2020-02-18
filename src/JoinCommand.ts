
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './GetOperation'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'

export function setupJoinExecution(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    let inputFinished = false;
    let searchFinished = false;
    let triggeredOutput = false;

    let searchRels = null;

    /*
    commandExec.input.on('done', () => {
        inputFinished = true;
        check();
    })
    */

    const search = collectRelationReceiverOutput((rels) => {
        searchRels = rels;
        searchFinished = true;
        check();
    });

    const check = () => {
        if (triggeredOutput)
            return;

        if (inputFinished && searchFinished) {
            triggeredOutput = true;
            sendOutput();
        }
    }

    const sendOutput = () => {
        console.log('join has finished!')
    }
}
