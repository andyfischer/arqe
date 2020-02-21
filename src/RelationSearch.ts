
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import RelationReceiver from './RelationReceiver'

export default interface RelationSearch extends RelationReceiver {
    pattern: RelationPattern;
    start: () => void
    relation: (rel: RelationPattern) => void
    finish: () => void
    isDone: () => boolean
}

