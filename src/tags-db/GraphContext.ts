
import Graph from './Graph'
import Command, { CommandTag } from './Command'

function containsTagType(tags: CommandTag[], tagType: string) {
    for (const arg of tags)
        if (arg.tagType === tagType)
            return true;

    return false;
}

export default class GraphContext {
    graph: Graph
    contextArgs: CommandTag[] = []

    constructor(graph: Graph) {
        this.graph = graph;
    }

    removeContextType(name: string) {
        this.contextArgs = this.contextArgs.filter(arg => arg.tagType !== name);
    }

    contextCommand(command: Command) {
        for (const arg of command.tags) {
            if (!arg.tagType)
                throw new Error('error: context arg needs type name: ' + JSON.stringify(arg));

            if (arg.subtract) {
                this.removeContextType(arg.tagType);
                continue;
            }

            this.removeContextType(arg.tagType);
            this.contextArgs.push(arg);
        }

        command.respond('#done');
    }

    async handleCommand(command: Command) {
        switch (command.command) {
        case 'context':
            this.contextCommand(command);
            return;
        }

        // Apply context tags to this command.
        for (const contextArg of this.contextArgs) {
            if (!containsTagType(command.tags, contextArg.tagType))
                command.tags.push(contextArg);
        }
        
        await this.graph.handleCommand(command);
    }
}
