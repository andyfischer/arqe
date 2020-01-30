
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { normalizeExactTag } from './parseCommand'
import saveRelation from './saveRelation'

export default class SetOperation {
    replyWithEcho = false
    graph: Graph
    command: Command
    relation: Relation

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
    }

    perform(respond: RespondFunc) {

        const { command } = this;

        // Validate
        for (const tag of command.tags) {
            if (tag.starValue) {
                respond("#error can't use star pattern in 'set'")
                return;
            }

            if (tag.star) {
                respond("#error can't use star pattern in 'set'")
                return;
            }

            if (tag.doubleStar) {
                respond("#error can't use star pattern in 'set'")
                return;
            }
        }

        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.schema.findTagType(arg.tagType).getUniqueId()
                this.replyWithEcho = true;
            }
        }

        const relation = saveRelation(this.graph, command);

        this.graph.onRelationUpdated(command, relation);

        if (this.replyWithEcho) {
            respond(this.graph.schema.stringifyRelation(relation));
        } else {
            respond("#done");
        }
    }
}
