
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { normalizeExactTag } from './parseCommand'
import StoragePlugin from './StoragePlugin'
import ExecutionPlan from './ExecutionPlan'

export default class SetOperation {
    replyWithEcho = false
    graph: Graph
    command: Command
    relation: Relation
    plan: ExecutionPlan;

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.plan = graph.getExecutionPlan(command);

        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.schema.findTagType(arg.tagType).getUniqueId()
                this.replyWithEcho = true;
            }
        }
    }

    perform(respond: RespondFunc) {
        const { command } = this;

        const relation = this.plan.save(command);

        this.graph.onRelationUpdated(command, relation);

        if (this.replyWithEcho) {
            respond(this.graph.schema.stringifyRelation(relation));
        } else {
            respond("#done");
        }
    }
}
