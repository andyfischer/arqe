
import Graph from './Graph'
import Command from './Command'
import RelationPipe from './RelationPipe'
import RelationReceiver from './RelationReceiver'

export default interface CommandRequest {
    graph: Graph
    command: Command
    input: RelationPipe
    output: RelationReceiver
}
