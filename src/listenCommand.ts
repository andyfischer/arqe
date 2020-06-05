
import Graph from './Graph'
import Tuple from './Tuple'
import { emitTupleDeleted } from './CommandMeta'
import CommandExecutionParams from './CommandExecutionParams'

export default function runListen(params: CommandExecutionParams) {

    const { graph, command, output } = params;
    const pattern = command.pattern;

    if (command.flags.get) {
        graph.tupleStore.searchUnplanned(pattern, {
            relation(rel) { output.relation(rel) },
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
