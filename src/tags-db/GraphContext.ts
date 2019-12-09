
import Graph from './Graph'
import Command, { CommandTag } from './Command'
import parseCommand, { parsedCommandToString } from './parseCommand'

function containsTagType(tags: CommandTag[], tagType: string) {
    for (const arg of tags)
        if (arg.tagType === tagType)
            return true;

    return false;
}

export default class GraphContext {
    graph: Graph
    contextArgs: CommandTag[] = []
    contextTypeMap: { [typeName: string]: true } = {}

    constructor(graph: Graph) {
        this.graph = graph;
    }

    refreshContextTypeMap() {
        const map = {}
        for (const arg of this.contextArgs) {
            map[arg.tagType] = true;
        }
        this.contextTypeMap = map;
    }

    removeContextType(name: string) {
        this.contextArgs = this.contextArgs.filter(arg => arg.tagType !== name);
        this.refreshContextTypeMap()
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

        this.refreshContextTypeMap()
        command.respond('#done');
    }

    translateResponse(msg: string) {
        if (msg.startsWith('save ')) {
            const parsed = parseCommand(msg);

            parsed.tags = parsed.tags.filter(tag => {
                if (this.contextTypeMap[tag.tagType])
                    return false;

                return true;
            });

            const backToStr = parsedCommandToString(parsed);
            return backToStr;
        }

        return msg;
    }

    async handleCommand(command: Command) {

        switch (command.command) {
        case 'context':
            this.contextCommand(command);
            return;
        }

        // Apply context tags to this command.
        for (const contextArg of this.contextArgs) {
            if (!containsTagType(command.tags, contextArg.tagType)) {
                command.tags.push(contextArg);
            }
        }

        const wrappedCommand = {
            ...command,
            respond: (msg) => command.respond(this.translateResponse(msg)),
            respondPart: command.respondPart,
            respondEnd: command.respondEnd,
        }
        
        await this.graph.handleCommand(wrappedCommand);
    }
}
