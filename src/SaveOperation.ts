
import Graph from './Graph'
import Tuple from './Tuple'
import Stream from './Stream'

export default interface SaveOperation {
    graph: Graph
    relation: Tuple
    output: Stream
}
