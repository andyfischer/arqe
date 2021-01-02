
import Pipe from './Pipe'
import Stream from './Stream'
import Tuple from './Tuple'
import { CommandFlags } from './Command'
import QueryContext from './QueryContext'

export default interface CommandParams {
    verb: string
    scope: QueryContext
    queryTerm: Tuple
    tuple: Tuple
    flags: CommandFlags
    input: Pipe
    output: Stream
}
