
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default interface SaveSearchHook {
    hookSave: (graph: Graph, relation: Relation, output: RelationReceiver) => boolean
}
