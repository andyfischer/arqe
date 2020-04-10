
import { emitActionPerformed } from './CommandMeta'
import Graph from './Graph'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default function runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver) {
    for (const rel of graph.inMemory.findAllMatches(pattern)) {
        if (rel.hasType('typeinfo'))
            throw new Error("can't delete a typeinfo relation");

        graph.inMemory.deleteRelation(rel);
        graph.onRelationDeleted(rel);
    }

    emitActionPerformed(output);
    output.finish();
}
