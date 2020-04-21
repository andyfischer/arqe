
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { hookObjectSpaceSearch, hookObjectSpaceSave } from './hookObjectSpace'

export default function runSet(graph: Graph, relation: Relation, output: RelationReceiver) {
    if (hookObjectSpaceSave(graph, relation, output))
        return;

    graph.inMemory.runSave(relation, {
        relation: (rel) => {
            graph.onRelationUpdated(relation);
            output.relation(rel);
        },
        finish: () => {
            output.finish()
        },
    });
}

