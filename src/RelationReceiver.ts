
import Relation from './Relation'

export default interface RelationReceiver {
    start: () => void
    relation: (rel: Relation) => void
    finish: () => void
}
