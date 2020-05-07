
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default interface SaveOperation {
    graph: Graph
    relation: Relation
    output: RelationReceiver
}
