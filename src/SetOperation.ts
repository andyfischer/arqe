
import Command from './Command'
import CommandExecution from './CommandExecution'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'

export default class SetOperation {
    graph: Graph
    command: Command
    commandExec: CommandExecution
    relation: Relation

    constructor(graph: Graph, commandExec: CommandExecution) {
        this.graph = graph;
        this.commandExec = commandExec;
        this.command = commandExec.command;
    }

    run() {

        const { command } = this;

        // Validate
        for (const tag of command.tags) {
            if (tag.starValue) {
                this.commandExec.output.error("can't use star pattern in 'set'")
                return;
            }

            if (tag.star) {
                this.commandExec.output.error("can't use star pattern in 'set'")
                return;
            }

            if (tag.doubleStar) {
                this.commandExec.output.error("can't use star pattern in 'set'")
                return;
            }
        }

        this.graph.inMemory.runSave(this);
    }

    saveFinished(relation?: Relation) {

        const { command } = this;

        if (!relation) {
            this.commandExec.output.error("#error couldn't save");
            return
        }

        this.graph.onRelationUpdated(command, relation);
        this.commandExec.output.start();
        this.commandExec.output.relation(relation);
        this.commandExec.output.finish();
    }
}
