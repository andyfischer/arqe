
import Graph from './Graph'
import Tuple from './Tuple'
import { emitTupleDeleted } from './CommandMeta'
import CommandExecutionParams from './CommandExecutionParams'
import getCommand from './commands/get'

export default function runListen(params: CommandExecutionParams) {

    const { graph, command, output } = params;
    const pattern = command.pattern;

    if (command.flags.get) {
        getCommand(graph, pattern, {
            next(rel) {
                if (!rel.isCommandMeta())
                    output.next(rel)
            },
            done() {}
        });
    }

    graph.addListener(pattern, {
        onTupleUpdated(rel: Tuple) {
            output.next(rel);
        },
        onTupleDeleted(rel: Tuple) {
            emitTupleDeleted(rel, output);
        }
    });
}
