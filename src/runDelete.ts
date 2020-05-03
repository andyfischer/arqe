
import { emitActionPerformed } from './CommandMeta'
import Graph from './Graph'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default function runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver) {

    for (const slot of graph.inMemory.iterateSlots(pattern)) {
        slot.del();
        graph.onRelationDeleted(slot.relation);
    }

    emitActionPerformed(output);
    output.finish();
}
