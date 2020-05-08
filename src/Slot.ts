
import Relation from './Relation'

export default interface Slot {
    relation: Relation
    modify: (f: (rel: Relation) => Relation) => Relation
}

