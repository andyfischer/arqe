
import Command from './Command'
import Graph, { RespondFunc } from './Graph'

export default class SetOperation {
    replyWithEcho = false
    graph: Graph
    command: Command
    respondFunc: RespondFunc

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.respondFunc = respond;
    }

    resolveSpecialTags() {
        const command = this.command;

        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.findTagType(arg.tagType).getUniqueId()
                this.replyWithEcho = true;
            }
        }
    }
}
