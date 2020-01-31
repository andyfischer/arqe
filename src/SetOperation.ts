
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { normalizeExactTag } from './stringifyQuery'

export default class SetOperation {
    replyWithEcho = false
    graph: Graph
    command: Command
    relation: Relation
    respond: RespondFunc;

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.respond = respond;
    }

    perform() {

        const { command, respond } = this;

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

        this.graph.inMemory.runSave(this);
    }

    saveFinished(relation?: Relation) {

        const { command, respond } = this;

        if (!relation)
            respond("#error couldn't save");

        this.graph.onRelationUpdated(command, relation);

        if (this.replyWithEcho) {
            respond(this.graph.schema.stringifyRelation(relation));
        } else {
            respond("#done");
        }
    }
}
