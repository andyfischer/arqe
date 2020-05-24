
import CommandStep from './CommandStep'
import Graph from './Graph'
import Relation from './Relation'
import { emitRelationDeleted } from './CommandMeta'

export default function runListen(graph: Graph, step: CommandStep) {

    if (step.flags.get) {
        const search = step.toRelationSearch();
        search.finish = () => null;
        graph.database.search(search.pattern, search);
    }

    graph.addListener(step.pattern, {
        onRelationUpdated(rel: Relation) {
            step.output.relation(rel);
        },
        onRelationDeleted(rel: Relation) {
            emitRelationDeleted(rel, step.output);
        }
    });
}
