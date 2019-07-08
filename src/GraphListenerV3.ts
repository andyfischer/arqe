
import Graph from './Graph'
import Command from './Command'
import Tuple from './Tuple'
import Pattern from './Pattern'

export default interface GraphListener{
    onTupleUpdated: (rel: Tuple) => void
    onTupleDeleted: (rel: Tuple) => void
}

export class GraphListenerMount{
    listener: GraphListener
    pattern: Pattern
}
