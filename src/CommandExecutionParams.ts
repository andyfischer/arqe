
import Graph from './Graph'
import Query from './Query'
import Pipe from './Pipe'
import Stream from './Stream'

export default interface CommandRequest {
    graph: Graph
    command: Query
    input: Pipe
    output: Pipe
}
