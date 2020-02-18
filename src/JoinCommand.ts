
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import { runSearch } from './GetOperation'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'

export function runJoin(commandExec: CommandExecution) {
    // run the search
    // wait for input
    // when both are done..
    // look for relations where the unbound item matches

    if (!commandExec.input)
        throw new Error('join expected input');

    let inputFinished = false;
    let searchFinished = false;
    let triggeredOutput = false;

    let searchRels = null;

    commandExec.input.onDone = () => {
        inputFinished = true;
        check();
    }

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
