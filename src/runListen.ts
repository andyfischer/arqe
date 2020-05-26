
import Graph from './Graph'
import Relation from './Relation'
import { emitRelationDeleted } from './CommandMeta'
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
        onRelationUpdated(rel: Relation) {
            output.relation(rel);
        },
        onRelationDeleted(rel: Relation) {
            emitRelationDeleted(rel, output);
        }
    });
}
