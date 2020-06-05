
import Graph from './Graph'
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export default interface SaveOperation {
    graph: Graph
    relation: Tuple
    output: TupleReceiver
}
