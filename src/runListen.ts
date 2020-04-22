
import CommandStep from './CommandStep'
import Graph from './Graph'
import Relation from './Relation'
import runSearch from './runSearch'
import { emitRelationDeleted } from './CommandMeta'

export default function runListen(graph: Graph, step: CommandStep) {

    if (step.flags.get) {
        const search = step.toRelationSearch();
        search.finish = () => null;
        runSearch(graph, search);
    }

    graph.addListenerV3(step.pattern, {
        onRelationUpdated(rel: Relation) {
            step.output.relation(rel);
        },
        onRelationDeleted(rel: Relation) {
            emitRelationDeleted(rel, step.output);
        }
    });
}
