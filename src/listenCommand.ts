
import Graph from './Graph'
import Tuple from './Tuple'
import { emitTupleDeleted } from './CommandMeta'
import CommandExecutionParams from './CommandExecutionParams'
import { runGet } from './runOneCommand'

export default function runListen(params: CommandExecutionParams) {

    const { graph, command, output } = params;
    const pattern = command.pattern;

    if (command.flags.get) {
        runGet(graph, pattern, {
            relation(rel) {
                if (!rel.isCommandMeta())
                    output.relation(rel)
            },
            finish() {}
        });
    }

    graph.addListener(pattern, {
        onTupleUpdated(rel: Tuple) {
            output.relation(rel);
        },
        onTupleDeleted(rel: Tuple) {
            emitTupleDeleted(rel, output);
        }
    });
}
