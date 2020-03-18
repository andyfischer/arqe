
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import CommandChain from './CommandChain'
import RelationReceiver, { receiveToNull } from './RelationReceiver'

import { setupGetExecution } from './GetCommand'
import { setupJoinExecution } from './JoinCommand'

function setupCommandExecution(commandExec: CommandExecution) {
    switch (commandExec.commandName) {
    case 'join':
        setupJoinExecution(commandExec);
        break;
    }
}

export function runCommandChain(graph: Graph, chain: CommandChain, output: RelationReceiver) {
    // Set up commands
    const commandExecs = chain.commands.map(command => {
        const exec = new CommandExecution(graph, command);
        setupCommandExecution(exec);
        return exec;
    });

    // Link up commands
    for (let index = 0; index < commandExecs.length; index++) {
        const isFirst = index == 0;
        const isLast = index == commandExecs.length - 1;
        const commandExec = commandExecs[index];

        if (isLast)
            commandExec.outputTo(output);

        if (!isLast) {
            const next = commandExecs[index + 1];
            if (!next.input) {
                commandExec.outputTo(receiveToNull());
                continue;
            }

            commandExec.outputTo(next.input);
        }
    }

    for (const commandExec of commandExecs)
        graph.runCommandExecution(commandExec);
}
