
import Graph from './Graph'
import CommandStep from './CommandStep'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'

export function runSetStep(graph: Graph, commandExec: CommandStep) {
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

    graph.inMemory.runSave(command.toRelation(), {
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

