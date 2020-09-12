
import Graph from './Graph'
import ParsedQuery from './ParsedQuery'
import Pipe from './Pipe'
import Tuple from './Tuple'
import { QueryFlags } from './ParsedQuery'

export default interface CommandParams {
    verb: string
    tuple: Tuple
    flags: QueryFlags
    input: Pipe
    output: Pipe
}
