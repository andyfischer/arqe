
import Command from './Command'
import CommandExecution from './CommandExecution'
import Graph from './Graph'
import Relation from './Relation'
import { emitCommandError } from './CommandMeta'

export function runSetOperation(graph: Graph, commandExec: CommandExecution) {
    const command = commandExec.command;
    const output = commandExec.output;

    if (!command)
        throw new Error('missing commandExec.command');

    // Validate
    for (const tag of command.tags) {
        if (tag.starValue || tag.star || tag.doubleStar) {
            emitCommandError(output, "can't use star pattern in 'set'");
            commandExec.output.finish();
            return;
        }
    }

    graph.inMemory.runSave(command, {
        start: () => output.start(),
        relation: (rel) => {
            graph.onRelationUpdated(command, rel);
            output.relation(rel);
        },
        finish: () => {
            output.finish()
        },
        isDone: () => false
    });
}
