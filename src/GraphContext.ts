
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import parseCommand from './parseCommand'
import { parsedCommandToString } from './stringifyQuery'
import PatternTag from './PatternTag'

function containsTagType(tags: PatternTag[], tagType: string) {
    for (const tag of tags)
        if (tag.tagType === tagType)
            return true;

    return false;
}

export default class GraphContext {
    graph: Graph
    contextTags: PatternTag[] = []
    contextTypeMap: { [typeName: string]: PatternTag } = {}
    optionalContextTagMap: { [ typeName: string]: PatternTag } = {}

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

    addOptionalContextTag(tag: PatternTag) {
        this.optionalContextTagMap[tag.tagType] = tag;
    }

    removeContextType(name: string) {
        this.contextTags = this.contextTags.filter(tag => tag.tagType !== name);
        this.refreshContextTypeMap()
    }

    contextCommand(command: Command, respond: RespondFunc) {
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
        respond('#done');
    }

    _translateResponse(msg: string) {
        if (msg.startsWith('set ')) {
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

    run(query: string, respond: RespondFunc) {
        if (typeof query !== 'string')
            throw new Error("expected string: " + query);
        if (typeof respond !== 'function')
            throw new Error("expected function: " + respond);

        const parsed = parseCommand(query);
        this.runCommandParsed(parsed, respond);
    }

    runCommandParsed(command: Command, respond: RespondFunc) {

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

        switch (command.commandName) {
        case 'context':
            this.contextCommand(command, respond);
            return;
        }

        // Apply context tags to this command.
        for (const contextArg of this.contextTags) {
            if (!containsTagType(command.tags, contextArg.tagType)) {
                command.tags.push(contextArg);
            }
        }

        const wrappedRespond = (msg) => {
            msg = this._translateResponse(msg);
            respond(msg);
        }

        this.graph.runCommandParsed(command, wrappedRespond);
    }
}
