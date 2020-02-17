
import Relation from './Relation'

export default interface RelationReceiver {
    start: () => void
    relation: (rel: Relation) => void
    deleteRelation: (rel: Relation) => void
    error: (str: string) => void
    finish: () => void
    isDone: () => boolean
}
