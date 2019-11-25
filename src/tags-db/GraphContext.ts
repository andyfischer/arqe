
import Graph from './Graph'
import Command, { CommandArg } from './Command'

function containsTagType(args: CommandArg[], tagType: string) {
    for (const arg of args)
        if (arg.tagType === tagType)
            return true;

    return false;
}

export default class GraphContext {
    graph: Graph
    contextArgs: CommandArg[] = []

    constructor(graph: Graph) {
        this.graph = graph;
    }

    removeContextType(name: string) {
        this.contextArgs = this.contextArgs.filter(arg => arg.tagType !== name);
    }

    contextCommand(command: Command) {
        for (const arg of command.args) {
            if (!arg.tagType)
                throw new Error('error: context arg needs type name: ' + JSON.stringify(arg));

            if (arg.subtract) {
                this.removeContextType(arg.tagType);
                continue;
            }

            this.removeContextType(arg.tagType);
            this.contextArgs.push(arg);
        }

        return '#done'
    }

    async handleCommand(command: Command) {
        switch (command.command) {
        case 'context':
            return this.contextCommand(command);
        }

        // Apply context args to this command.
        for (const contextArg of this.contextArgs) {
            if (!containsTagType(command.args, contextArg.tagType))
                command.args.push(contextArg);
        }
        
        return await this.graph.handleCommand(command);
    }
}
