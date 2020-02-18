
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import CommandChain from './CommandChain'
import RelationReceiver from './RelationReceiver'

export function runCommandChain(graph: Graph, chain: CommandChain, output: RelationReceiver) {
    // WIP
    console.log('saw chain: ', chain.stringify());

    const commandExecs = chain.commands.map(command => {
        const exec = new CommandExecution(graph, command);
        this.setupCommandExecution(exec);
        return exec;
    });

    // Link up commands
    for (let index = 0; index < commandExecs.length; index++) {
        const isFirst = index == 0;
        const isLast = index == commandExecs.length - 1;
        const commandExec = commandExecs[index];

        //if (isLast)
        //    commandExec.outputToStringRespond(respond);

        if (!isLast) {
            const next = commandExecs[index + 1];
            if (!next.input)
                throw new Error(`piped command '${next.command.commandName}' didn't expect input`);

            commandExec.outputTo(next.input);
        }
    }

    for (const commandExec of commandExecs)
        graph.runCommandExecution(commandExec);
}
