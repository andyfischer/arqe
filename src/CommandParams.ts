
import Pipe from './utils/Pipe'
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
