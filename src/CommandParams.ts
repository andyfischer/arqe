
import Graph from './Graph'
import Query from './Query'
import Pipe from './Pipe'

export default interface CommandParams {
    command: Query
    input: Pipe
    output: Pipe
}
