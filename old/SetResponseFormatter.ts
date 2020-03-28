
import Command from './Command'
import Relation from './Relation'
import Graph, { RespondFunc } from './Graph'
import RelationReceiver  from './RelationReceiver'

export default class SetResponseFormatter implements RelationReceiver {
    respond: RespondFunc
    graph: Graph
    replyWithEcho = false

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.respond = respond;

        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.getTypeInfo(arg.tagType).getUniqueId()
                this.replyWithEcho = true;
            }
        }
    }

    start() {
    }

    relation(rel: Relation) {
        if (rel.hasType('command-meta') && rel.hasType('error')) {
            this.respond('#error ' + rel.getValue())
            return;
        }

        if (this.replyWithEcho) {
            this.respond(rel.stringifyToCommand());
        } else {
           this.respond("#done");
        }
    }

    deleteRelation() {}

    isDone() { return false }

    finish() { }
}
