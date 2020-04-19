
import { emitActionPerformed } from './CommandMeta'
import Graph from './Graph'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default function runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver) {
    graph.inMemory.runDelete(graph, pattern, output);
}
