
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default interface RelationSearch extends RelationReceiver {
    pattern: Pattern;
    subSearchDepth: number

    relation: (rel: Pattern) => void
    finish: () => void
    isDone: () => boolean
}

