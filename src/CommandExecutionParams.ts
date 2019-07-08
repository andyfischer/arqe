
import Graph from './Graph'
import Command from './Command'
import Pipe from './Pipe'
import Stream from './Stream'

export default interface CommandRequest {
    graph: Graph
    command: Command
    input: Pipe
    output: Stream
}
