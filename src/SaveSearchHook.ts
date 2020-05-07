
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import SearchOperation from './SearchOperation'

export default interface SaveSearchHook {
    hookSearch: (search: SearchOperation) => boolean
    hookSave: (graph: Graph, relation: Relation, output: RelationReceiver) => boolean
}
