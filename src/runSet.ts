
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { hookObjectSpaceSearch, hookObjectSpaceSave } from './hookObjectSpace'

export default function runSet(graph: Graph, relation: Relation, output: RelationReceiver) {
    // Validate
    for (const tag of relation.tags) {
        if (tag.starValue || tag.star || tag.doubleStar) {
            emitCommandError(output, "can't use star pattern in 'set'");
            output.finish();
            return;
        }
    }

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
        isDone: () => false
    });
}

