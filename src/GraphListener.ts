
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'

export default interface GraphListener {
    onRelationUpdated: (rel: Relation) => void
    onRelationDeleted: (rel: Relation) => void
}
