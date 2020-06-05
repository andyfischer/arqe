
import Graph from './Graph'
import Command from './Command'
import RelationPipe from './RelationPipe'
import TupleReceiver from './TupleReceiver'

export default interface CommandRequest {
    graph: Graph
    command: Command
    input: RelationPipe
    output: TupleReceiver
}
