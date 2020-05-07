
import Graph from './Graph'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default interface SearchOperation extends RelationReceiver {
    graph: Graph
    pattern: Pattern;
    subSearchDepth: number

    relation: (rel: Pattern) => void
    finish: () => void
}

export function newRelationSearch(graph: Graph, pattern: Pattern, output: RelationReceiver): SearchOperation {
    return {
        graph,
        pattern,
        subSearchDepth: 0,
        relation(rel) { output.relation(rel) },
        finish() { output.finish() }
    }

}
