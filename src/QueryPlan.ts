
import Tuple from './Tuple'
import TupleTag from './TupleTag'
import Stream from './Stream'
import TableMount from './TableMount'

export interface QueryTag {
    tag: TupleTag
}

export default interface QueryPlan {
    tags: QueryTag[]

    singleStar: boolean
    doubleStar: boolean
    isUpdate: boolean
    isDelete?: boolean
    initializeIfMissing: boolean

    originalTuple: Tuple
    tuple: Tuple
    output: Stream

    table?: TableMount
    tableName?: string
    searchTables?: TableMount[]

    failed: boolean
}
