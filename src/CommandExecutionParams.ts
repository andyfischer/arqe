
import Graph from './Graph'
import Command from './Command'
import RelationPipe from './RelationPipe'
import Stream from './Stream'

export default interface CommandRequest {
    graph: Graph
    command: Command
    input: RelationPipe
    output: Stream
}
