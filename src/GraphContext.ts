
import Graph from './Graph'
import Command, { CommandTag } from './Command'
import parseCommand, { parsedCommandToString } from './parseCommand'

function containsTagType(tags: CommandTag[], tagType: string) {
    for (const tag of tags)
        if (tag.tagType === tagType)
            return true;

    return false;
}

export default class GraphContext {
    graph: Graph
    contextTags: CommandTag[] = []
    contextTypeMap: { [typeName: string]: CommandTag } = {}
    optionalContextTagMap: { [ typeName: string]: CommandTag } = {}

    constructor(graph: Graph) {
        this.graph = graph;
    }

    refreshContextTypeMap() {
        const map = {}
        for (const tag of this.contextTags) {
            map[tag.tagType] = tag;
        }
        this.contextTypeMap = map;
    }

    addOptionalContextTag(tag: CommandTag) {
        this.optionalContextTagMap[tag.tagType] = tag;
    }

    removeContextType(name: string) {
        this.contextTags = this.contextTags.filter(tag => tag.tagType !== name);
        this.refreshContextTypeMap()
    }

    contextCommand(command: Command) {
        for (const tag of command.tags) {
            if (tag.tagType === '/')
                throw new Error("parsing error, found tagType of '/'");

            if (!tag.tagType)
                throw new Error('error: context tag needs type name: ' + JSON.stringify(tag));

            if (tag.negate) {
                this.removeContextType(tag.tagType);
                continue;
            }

            this.removeContextType(tag.tagType);
            this.contextTags.push(tag);
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

        // Resolve any '?' tags that we know of.
        for (let i = 0; i < command.tags.length; i += 1) {
            const tag = command.tags[i];

            if (!tag.questionValue)
                continue;

            if (this.contextTypeMap[tag.tagType]) {
                command.tags[i] = {
                    ...this.contextTypeMap[tag.tagType]
                }
                continue;
            }

            if (this.optionalContextTagMap[tag.tagType]) {
                command.tags[i] = {
                    ...this.optionalContextTagMap[tag.tagType]
                }
                continue;
            }
        }

        switch (command.command) {
        case 'context':
            this.contextCommand(command);
            return;
        }

        // Apply context tags to this command.
        for (const contextArg of this.contextTags) {
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
