
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'

export default interface GraphListenerV3 {
    onRelationUpdated: (rel: Relation) => void
    onRelationDeleted: (rel: Relation) => void
}

export class GraphListenerMountV3 {
    listener: GraphListenerV3
    pattern: Pattern
}
