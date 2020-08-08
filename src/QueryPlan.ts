
import Tuple from './Tuple'
import TupleTag from './TupleTag'
import Stream from './Stream'
import TableMount from './TableMount'

export interface QueryTag {
    tag: TupleTag
}

export default interface QueryPlan {
    originalTuple: Tuple
    tuple: Tuple
    output: Stream

    failed: boolean
}
