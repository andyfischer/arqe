
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { normalizeExactTag } from './parseCommand'

export default class SetOperation {
    replyWithEcho = false
    graph: Graph
    command: Command
    respond: RespondFunc

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.respond = respond;
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

    perform() {
        const { command, respond } = this;

        this.resolveSpecialTags();

        const ntag = normalizeExactTag(command.tags);

        // TODO: Custom storage
        let relation = this.graph.relationsByNtag[ntag];

        if (relation) {
            relation.setPayload(command.payloadStr);
        } else {
            relation = new Relation(this.graph, ntag, command.tags, command.payloadStr);
            this.graph.relationsByNtag[ntag] = relation;
        }

        this.graph.onRelationUpdated(command, relation);

        if (this.replyWithEcho) {
            respond(this.graph.stringifyRelation(relation));
        } else {
            respond("#done");
        }
    }
}
