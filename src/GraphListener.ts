
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'

export default interface GraphListener {
    onRelationUpdated: (rel: Relation) => void
    onRelationDeleted: (rel: Relation) => void
}
