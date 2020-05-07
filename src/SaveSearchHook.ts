
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import SearchOperation from './SearchOperation'
import SaveOperation from './SaveOperation'

export default interface SaveSearchHook {
    hookSearch: (search: SearchOperation) => boolean
    hookSave: (save: SaveOperation) => boolean
}