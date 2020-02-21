
import Command from './Command'
import CommandExecution from './CommandExecution'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { emitCommandError } from './CommandMeta'

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
                emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }

            if (tag.star) {
                emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }

            if (tag.doubleStar) {
                emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }
        }

        this.graph.inMemory.runSave(this);
    }

    saveFinished(relation?: Relation) {

        const { command } = this;

        if (!relation) {
            emitCommandError(this.commandExec.output, "couldn't save");
            return
        }

        this.graph.onRelationUpdated(command, relation);
        this.commandExec.output.start();
        this.commandExec.output.relation(relation);
        this.commandExec.output.finish();
    }
}
