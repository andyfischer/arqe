
import Pipe from './Pipe'
import Stream from './Stream'
import Tuple from './Tuple'
import { CommandFlags } from './Command'

export default interface CommandParams {
    verb: string
    tuple: Tuple
    flags: CommandFlags
    input: Pipe
    output: Stream
}
